'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Фикс гидратации - устанавливаем mounted на клиенте
  useEffect(() => {
    setMounted(true)
    
    // Проверяем URL параметры для сообщений
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    
    if (message === 'registration_success') {
      setSuccessMessage('Регистрация прошла успешно! Теперь войдите в свой аккаунт.')
    }

    // Инициализация 3D сцены
    const initThreeJS = () => {
      if (typeof window === 'undefined') return

      const canvas = document.getElementById('cubes-canvas') as HTMLCanvasElement
      if (!canvas) return

      // Динамический импорт Three.js
      import('three').then((THREE) => {
        // Setup
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
        renderer.setPixelRatio(window.devicePixelRatio || 1)

                 const scene = new THREE.Scene()
         scene.fog = new THREE.Fog(0xf8faff, 15, 30)

        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
        camera.position.z = 15

        // Particle background
        const particleCount = 1000
        const particles = new THREE.BufferGeometry()
        const posArr = new Float32Array(particleCount * 3)
        const velocities: any[] = []
        for(let i = 0; i < particleCount; i++) {
          posArr[i*3] = (Math.random()-0.5)*30
          posArr[i*3+1] = (Math.random()-0.5)*30
          posArr[i*3+2] = (Math.random()-0.5)*30
          velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
          })
        }
        particles.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
        const particleMaterial = new THREE.PointsMaterial({ color: 0x4262ff, size:0.06, transparent:true, opacity:0.4 })
        const particleSystem = new THREE.Points(particles, particleMaterial)
        scene.add(particleSystem)

        // Grid of Cubes - Bau4You colors
        const cubes: any[] = []
        const gridSize = 5, spacing = 2
        for(let x=0;x<gridSize;x++) for(let y=0;y<gridSize;y++) for(let z=0;z<gridSize;z++) {
          const geo = new THREE.BoxGeometry(1,1,1)
          // Calculate color variation with Bau4You blue
          const l = 0.3 + 0.5 * ((x + y + z) / (gridSize*3-3))
          const blue = new THREE.Color().setHSL(0.6, 0.8, l) // Blue hue with variation
          const mat = new THREE.MeshPhongMaterial({
            color: blue,
            shininess: 90,
            transparent: true,
            opacity: 0.82
          })
          const cube = new THREE.Mesh(geo, mat)
          cube.position.x = (x-gridSize/2)*spacing
          cube.position.y = (y-gridSize/2)*spacing
          cube.position.z = (z-gridSize/2)*spacing
          cube.userData = {
            initialScale: 1,
            targetScale: 1,
            initialColor: mat.color.clone(),
            isSelected: false,
            initialX: cube.position.x,
            initialY: cube.position.y,
            initialZ: cube.position.z,
            rotationSpeed: 0.012,
            pulsePhase: Math.random()*Math.PI*2
          }
          scene.add(cube)
          cubes.push(cube)
        }

        // Lighting
        const light1 = new THREE.DirectionalLight(0xffffff, 0.95)
        light1.position.set(1,1,1)
        scene.add(light1)
        const light2 = new THREE.DirectionalLight(0xffffff, 0.35)
        light2.position.set(-1,-1,-1)
        scene.add(light2)
        scene.add(new THREE.AmbientLight(0x404040, 0.9))

        // Raycaster
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()
        let hoveredCube: any = null, isPaused = false

        // Responsive resize for canvas
        function resizeCanvas() {
          const w = canvas.clientWidth, h = canvas.clientHeight
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        window.addEventListener('resize', resizeCanvas)

        // Mouse event handlers
        function getPointer(event: MouseEvent) {
          const rect = canvas.getBoundingClientRect()
          return {
            x: ((event.clientX-rect.left) / rect.width) * 2 - 1,
            y: -((event.clientY-rect.top) / rect.height) * 2 + 1
          }
        }

        canvas.addEventListener('mousemove', (event) => {
          const p = getPointer(event)
          mouse.x = p.x; mouse.y = p.y
          raycaster.setFromCamera(mouse, camera)
          const intersects = raycaster.intersectObjects(cubes)

          if (hoveredCube && (!intersects.length || intersects[0].object !== hoveredCube)) {
            if (!hoveredCube.userData.isSelected) {
              hoveredCube.material.opacity = 0.82
              hoveredCube.material.emissive.setHex(0x000000)
            }
            hoveredCube = null
          }
          if (intersects.length) {
            const cube = intersects[0].object
            if (cube !== hoveredCube) {
              hoveredCube = cube
              if (!cube.userData.isSelected) {
                cube.material.opacity = 1
                cube.material.emissive.setHex(0x111111)
              }
            }
          }
        })

        canvas.addEventListener('click', (event) => {
          raycaster.setFromCamera(mouse, camera)
          const intersects = raycaster.intersectObjects(cubes)
          if (intersects.length > 0) {
            const cube = intersects[0].object
            cube.userData.isSelected = !cube.userData.isSelected
            if (cube.userData.isSelected) {
              cube.userData.targetScale = 1.47
              cube.userData.rotationSpeed = 0.07
              cube.material.color.setHex(0x4262ff)
              cube.material.opacity = 1
            } else {
              cube.userData.targetScale = 1
              cube.userData.rotationSpeed = 0.012
              cube.material.color.copy(cube.userData.initialColor)
              cube.material.opacity = 0.82
            }
          }
        })

        // Animation Loop
        function animate() {
          if (isPaused) return
          requestAnimationFrame(animate)

          const t = Date.now()*0.001
          // Particle movement
          const positions = particleSystem.geometry.attributes.position.array as Float32Array
          for(let i=0;i<particleCount;i++) {
            positions[i*3] += velocities[i].x
            positions[i*3+1] += velocities[i].y
            positions[i*3+2] += velocities[i].z
            if (Math.abs(positions[i*3]) > 15) positions[i*3] = -positions[i*3]
            if (Math.abs(positions[i*3+1]) > 15) positions[i*3+1] = -positions[i*3+1]
            if (Math.abs(positions[i*3+2]) > 15) positions[i*3+2] = -positions[i*3+2]
          }
          particleSystem.geometry.attributes.position.needsUpdate = true

          cubes.forEach((cube, i) => {
            const offset = i*0.1
            cube.position.x = cube.userData.initialX + Math.sin(t + offset)*0.52
            cube.position.y = cube.userData.initialY + Math.cos(t + offset)*0.52
            const pulse = Math.sin(t*2 + cube.userData.pulsePhase)*0.09
            const targetScale = cube.userData.targetScale + pulse
            cube.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.13)
            cube.rotation.x += cube.userData.rotationSpeed
            cube.rotation.y += cube.userData.rotationSpeed
          })

          camera.position.x = Math.sin(t*0.5) * 15
          camera.position.z = Math.cos(t*0.5) * 15
          camera.lookAt(scene.position)

          renderer.render(scene, camera)
        }

        resizeCanvas()
        animate()
      }).catch(console.error)
    }

    // Запускаем инициализацию после монтирования
    setTimeout(initThreeJS, 100)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log('[Login] Попытка входа с email:', formData.email)
      const { data, error } = await signIn(formData.email, formData.password)
      
      console.log('[Login] Результат входа:', { data: !!data, error: error?.message })
      
      if (error) {
        console.error('[Login] Ошибка входа:', error)
        throw error
      }

      if (data?.user) {
        console.log('[Login] Пользователь успешно вошел:', data.user.email)
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
        console.log('[Login] Перенаправление на:', redirectTo)
        
        // Принудительное перенаправление через window.location для надежности
        window.location.href = redirectTo
      } else {
        throw new Error('Не удалось получить данные пользователя')
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('[Login] Ошибка при входе:', error)
      setError(error.message || 'Произошла ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  // Предотвращаем рендеринг до монтирования на клиенте
  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">
            Загрузка...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500&family=Inter:wght@400;500;600&display=swap');
        
        html, body {
          background: #ffffff;
          font-family: 'Inter', sans-serif;
        }
        .jakarta {
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif !important;
          font-weight: 300 !important;
          letter-spacing: -0.03em !important;
        }
        .tight-tracking { 
          letter-spacing: -0.03em; 
        }
        #cubes-canvas { 
          display: block; 
          outline: none; 
          width: 100%; 
          height: 100%; 
          background: transparent; 
        }
      `}</style>
      
      <main className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto shadow-2xl rounded-2xl bg-white border border-gray-100 flex overflow-hidden">
          {/* Left Side: Login */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 py-16">
            {/* Logo/Brand */}
            <Link href="/" className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: '#4262ff20', color: '#4262ff'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
                  <circle cx="12" cy="8" r="6"/>
                </svg>
                Bau4You
              </div>
            </Link>

            <h1 className="jakarta tight-tracking text-gray-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 font-light">
              Добро<br/>пожаловать
            </h1>
            <p className="text-gray-600 text-lg mb-10 font-normal">
              Войдите в свой аккаунт для продолжения работы
            </p>

                         {error && (
               <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                 {error}
               </div>
             )}
             
             {successMessage && (
               <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                 {successMessage}
               </div>
             )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                             <div>
                 <label className="block text-gray-700 text-[15px] mb-2 font-medium" htmlFor="email">
                   Email
                 </label>
                 <input 
                   className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 text-[16px] focus:outline-none focus:ring-2 focus:border-transparent transition focus:ring-blue-500" 
                   type="email" 
                   id="email" 
                   name="email"
                   placeholder="you@email.com" 
                   autoComplete="username"
                   value={formData.email}
                   onChange={handleInputChange}
                   required
                 />
               </div>
               <div>
                 <label className="block text-gray-700 text-[15px] mb-2 font-medium" htmlFor="password">
                   Пароль
                 </label>
                 <input 
                   className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 text-[16px] focus:outline-none focus:ring-2 focus:border-transparent transition focus:ring-blue-500"
                   type="password" 
                   id="password" 
                   name="password"
                   placeholder="••••••••" 
                   autoComplete="current-password"
                   value={formData.password}
                   onChange={handleInputChange}
                   required
                 />
               </div>
               <div className="flex items-center justify-between">
                 <label className="flex items-center text-gray-600 text-[14px] font-normal">
                   <input type="checkbox" className="mr-2" style={{accentColor: '#4262ff'}} />
                   Запомнить меня
                 </label>
                 <Link href="/reset-password" className="text-[14px] hover:underline" style={{color: '#4262ff'}}>
                   Забыли пароль?
                 </Link>
               </div>
                             <button 
                 type="submit" 
                 disabled={isLoading}
                 className="mt-4 w-full py-3 rounded-lg text-white text-[16px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                 style={{backgroundColor: '#4262ff'}}
                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3651e6'}
                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
               >
                 {isLoading ? 'Вход...' : 'Войти'}
               </button>
             </form>
             <div className="mt-8 text-gray-600 text-[15px]">
               Нет аккаунта?{' '}
               <Link href="/register" className="hover:underline" style={{color: '#4262ff'}}>
                 Зарегистрироваться
               </Link>
             </div>
          </div>
          
                     {/* Right Side: 3D Cubes */}
           <div className="hidden lg:flex w-1/2 relative items-center justify-center" style={{background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)'}}>
             <canvas id="cubes-canvas" className="w-full h-[540px] md:h-[640px] rounded-xl"></canvas>
           </div>
        </div>
      </main>
    </>
  )
}