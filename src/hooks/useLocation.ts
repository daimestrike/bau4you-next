import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Region {
  id: string
  name: string
}

interface City {
  id: string
  region_id: string
  name: string
}

interface LocationData {
  regionId: string
  cityId: string
  regionName: string
  cityName: string
  fullLocation: string // "Регион, Город"
}

export function useLocation(initialRegionId = '', initialCityId = '') {
  const [regions, setRegions] = useState<Region[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    regionId: initialRegionId,
    cityId: initialCityId,
    regionName: '',
    cityName: '',
    fullLocation: ''
  })

  // Загружаем регионы при инициализации
  useEffect(() => {
    loadRegions()
  }, [])

  // Загружаем города при смене региона
  useEffect(() => {
    if (selectedLocation.regionId) {
      loadCities(selectedLocation.regionId)
    } else {
      setCities([])
    }
  }, [selectedLocation.regionId])

  // Инициализация при загрузке начальных данных
  useEffect(() => {
    if (initialRegionId && regions.length > 0) {
      const region = regions.find(r => r.id === initialRegionId)
      if (region) {
        setSelectedLocation(prev => ({
          ...prev,
          regionId: initialRegionId,
          regionName: region.name,
          fullLocation: region.name
        }))
      }
    }
  }, [initialRegionId, regions])

  useEffect(() => {
    if (initialCityId && cities.length > 0) {
      const city = cities.find(c => c.id === initialCityId)
      if (city) {
        setSelectedLocation(prev => ({
          ...prev,
          cityId: initialCityId,
          cityName: city.name,
          fullLocation: `${prev.regionName}, ${city.name}`
        }))
      }
    }
  }, [initialCityId, cities])

  const loadRegions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Ошибка загрузки регионов:', error)
        return
      }

      setRegions(data || [])
    } catch (error) {
      console.error('Ошибка:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCities = async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, region_id, name')
        .eq('region_id', regionId)
        .order('name')

      if (error) {
        console.error('Ошибка загрузки городов:', error)
        return
      }

      setCities(data || [])
    } catch (error) {
      console.error('Ошибка:', error)
    }
  }

  const selectRegion = (regionId: string, regionName: string) => {
    setSelectedLocation({
      regionId,
      cityId: '',
      regionName,
      cityName: '',
      fullLocation: regionName
    })
  }

  const selectCity = (cityId: string, cityName: string) => {
    setSelectedLocation(prev => ({
      ...prev,
      cityId,
      cityName,
      fullLocation: `${prev.regionName}, ${cityName}`
    }))
  }

  const reset = () => {
    setSelectedLocation({
      regionId: '',
      cityId: '',
      regionName: '',
      cityName: '',
      fullLocation: ''
    })
    setCities([])
  }

  return {
    regions,
    cities,
    loading,
    selectedLocation,
    selectRegion,
    selectCity,
    reset,
    loadCities
  }
} 