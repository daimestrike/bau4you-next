'use client'

import { useEffect, useState } from 'react'
import { getAllProjects, checkProjectsTableStructure, createProject, supabase } from '@/lib/supabase'

export default function TestProjectPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    console.log(message)
    setResults(prev => [...prev, message])
  }

  const testProjectOperations = async () => {
    setLoading(true)
    setResults([])

    try {
      // 1. Проверяем структуру таблицы
      addResult('=== ТЕСТ: Проверяем структуру таблицы ===')
      await checkProjectsTableStructure()

      // 2. Получаем все проекты
      addResult('=== ТЕСТ: Получаем все проекты ===')
      const { data: allProjects, error: allError } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })

      if (allError) {
        addResult(`Ошибка получения всех проектов: ${allError.message}`)
      } else {
        addResult(`Найдено проектов: ${allProjects?.length || 0}`)
        allProjects?.forEach((project, index) => {
          addResult(`${index + 1}. ID: ${project.id}, Название: ${project.name}`)
        })

        // 3. Пробуем получить первый проект по ID
        if (allProjects && allProjects.length > 0) {
          const firstProjectId = allProjects[0].id
          addResult(`=== ТЕСТ: Получаем проект по ID: ${firstProjectId} ===`)
          
          const { data: singleProject, error: singleError } = await supabase
            .from('projects')
            .select(`
              *,
              regions(name),
              cities(name)
            `)
            .eq('id', firstProjectId)
            .single()

          if (singleError) {
            addResult(`Ошибка получения проекта по ID: ${singleError.message}`)
            addResult(`Код ошибки: ${singleError.code}`)
            addResult(`Детали: ${singleError.details}`)
          } else {
            addResult(`✅ Проект найден: ${singleProject?.name}`)
            addResult(`Полные данные: ${JSON.stringify(singleProject, null, 2)}`)
          }
        }
      }

      // 4. Создаем новый проект и сразу пробуем его получить
      addResult('=== ТЕСТ: Создаем проект и сразу получаем его ===')
      const testProjectData = {
        name: `Тестовый проект ${Date.now()}`,
        description: 'Простой тест создания проекта',
        category: 'Тест',
        location: 'Тест',
        status: 'planning' as const
      }

      const { data: newProject, error: createError } = await createProject(testProjectData)
      
      if (createError) {
        addResult(`Ошибка создания проекта: ${createError.message}`)
      } else if (newProject) {
        addResult(`✅ Проект создан с ID: ${newProject.id}`)
        
        // Сразу пробуем получить созданный проект
        const { data: fetchedProject, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', newProject.id)
          .single()

        if (fetchError) {
          addResult(`❌ Не удалось получить только что созданный проект: ${fetchError.message}`)
        } else {
          addResult(`✅ Только что созданный проект найден: ${fetchedProject?.name}`)
        }
      }

    } catch (error) {
      addResult(`Общая ошибка: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testProjectOperations()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Диагностика проектов</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Результаты тестов</h2>
          <button
            onClick={testProjectOperations}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Тестирование...' : 'Запустить тесты'}
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-2 rounded text-sm font-mono ${
                result.includes('✅') ? 'bg-green-100 text-green-800' :
                result.includes('❌') ? 'bg-red-100 text-red-800' :
                result.includes('===') ? 'bg-blue-100 text-blue-800 font-bold' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 