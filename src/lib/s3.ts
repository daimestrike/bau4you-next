import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Конфигурация S3 для Timeweb.cloud
const s3Config = {
  endpoint: 'https://s3.timeweb.cloud',
  region: 'ru-1',
  credentials: {
    accessKeyId: process.env.TIMEWEB_S3_ACCESS_KEY || 'OWWIPYGKNRTKUGAMDVTN',
    secretAccessKey: process.env.TIMEWEB_S3_SECRET_KEY || 'Fpse8SZkaDeKPpqkolYj3tTrbASx1wfYyKHphgbE'
  },
  forcePathStyle: true // Важно для совместимости с S3-подобными сервисами
}

const BUCKET_NAME = process.env.TIMEWEB_S3_BUCKET || '5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4'
const PUBLIC_URL = `https://${BUCKET_NAME}.s3.timeweb.cloud`

// Создаем клиент S3
export const s3Client = new S3Client(s3Config)

// Типы файлов
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Генерация уникального имени файла
export const generateFileName = (originalName: string, userId?: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const prefix = userId ? `users/${userId}` : 'uploads'
  
  return `${prefix}/${timestamp}-${random}.${extension}`
}

// Получение подписанного URL для загрузки
export const getPresignedUploadUrl = async (
  fileName: string,
  contentType: string,
  expiresIn: number = 3600 // 1 час
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
    ACL: 'public-read' // Делаем файл публично доступным
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

// Загрузка файла напрямую
export const uploadFile = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read'
  })

  await s3Client.send(command)
  return `${PUBLIC_URL}/${fileName}`
}

// Удаление файла
export const deleteFile = async (fileName: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName
  })

  await s3Client.send(command)
}

// Получение публичного URL файла
export const getPublicUrl = (fileName: string): string => {
  return `${PUBLIC_URL}/${fileName}`
}

// Валидация файла
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Проверка типа файла
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP, GIF'
    }
  }

  // Проверка размера файла
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  return { valid: true }
}

// Извлечение имени файла из URL
export const extractFileNameFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.startsWith('/') ? pathname.substring(1) : pathname
  } catch {
    return null
  }
}