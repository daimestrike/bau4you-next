'use client'

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

interface LocationSelectorProps {
  regionId?: string
  cityId?: string
  onRegionChange: (regionId: string, regionName: string) => void
  onCityChange: (cityId: string, cityName: string) => void
  required?: boolean
  disabled?: boolean
  className?: string
  placeholder?: {
    region?: string
    city?: string
  }
}

export default function LocationSelector({
  regionId = '',
  cityId = '',
  onRegionChange,
  onCityChange,
  required = false,
  disabled = false,
  className = '',
  placeholder = {}
}: LocationSelectorProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingRegions, setLoadingRegions] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [selectedRegionId, setSelectedRegionId] = useState(regionId)
  const [selectedCityId, setSelectedCityId] = useState(cityId)

  // Загрузка регионов при монтировании компонента
  useEffect(() => {
    loadRegions()
  }, [])

  // Загрузка городов при изменении региона
  useEffect(() => {
    if (selectedRegionId) {
      loadCities(selectedRegionId)
    } else {
      setCities([])
      setSelectedCityId('')
    }
  }, [selectedRegionId])

  // Синхронизация с внешними пропсами
  useEffect(() => {
    setSelectedRegionId(regionId)
  }, [regionId])

  useEffect(() => {
    setSelectedCityId(cityId)
  }, [cityId])

  const loadRegions = async () => {
    try {
      setLoadingRegions(true)
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
      setLoadingRegions(false)
    }
  }

  const loadCities = async (regionId: string) => {
    try {
      setLoadingCities(true)
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
    } finally {
      setLoadingCities(false)
    }
  }

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegionId = e.target.value
    const region = regions.find(r => r.id === newRegionId)
    
    setSelectedRegionId(newRegionId)
    setSelectedCityId('') // Сбрасываем город при смене региона
    
    if (newRegionId && region) {
      onRegionChange(newRegionId, region.name)
    } else {
      onRegionChange('', '')
    }
    
    // Сбрасываем город в callback
    onCityChange('', '')
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCityId = e.target.value
    const city = cities.find(c => c.id === newCityId)
    
    setSelectedCityId(newCityId)
    
    if (newCityId && city) {
      onCityChange(newCityId, city.name)
    } else {
      onCityChange('', '')
    }
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Выбор региона */}
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
          Регион {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="region"
          value={selectedRegionId}
          onChange={handleRegionChange}
          required={required}
          disabled={disabled || loadingRegions}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingRegions 
              ? 'Загрузка регионов...' 
              : placeholder.region || 'Выберите регион'
            }
          </option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Выбор города */}
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          Город {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="city"
          value={selectedCityId}
          onChange={handleCityChange}
          required={required}
          disabled={disabled || !selectedRegionId || loadingCities}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {!selectedRegionId 
              ? 'Сначала выберите регион'
              : loadingCities 
                ? 'Загрузка городов...' 
                : placeholder.city || 'Выберите город'
            }
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
} 