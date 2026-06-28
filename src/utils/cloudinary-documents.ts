import { v2 as cloudinary } from 'cloudinary'

type CloudinaryClient = typeof cloudinary

type CloudinaryUploadResult = {
  bytes?: number
  format?: string
  public_id?: string
  resource_type?: string
  secure_url?: string
  type?: string
}

export type StoredCloudinaryDocument = {
  bytes: number
  deliveryType: string
  format: string | null
  publicId: string
  resourceType: string
  secureUrl: string
}

const defaultDeliveryType = 'private'
const defaultResourceType = 'raw'
let cloudinaryConfigured = false

const getRequiredCloudinaryEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}. Add it to your environment variables before uploading documents.`)
  }

  return value
}

const configureCloudinaryFromUrl = (cloudinaryUrl: string) => {
  const parsedUrl = new URL(cloudinaryUrl)

  if (parsedUrl.protocol !== 'cloudinary:') {
    throw new Error('CLOUDINARY_URL must start with cloudinary://')
  }

  cloudinary.config({
    api_key: decodeURIComponent(parsedUrl.username),
    api_secret: decodeURIComponent(parsedUrl.password),
    cloud_name: parsedUrl.hostname,
    secure: true
  })
}

export const getCloudinaryClient = (): CloudinaryClient => {
  if (!cloudinaryConfigured) {
    if (process.env.CLOUDINARY_URL) {
      configureCloudinaryFromUrl(process.env.CLOUDINARY_URL)
    } else {
      cloudinary.config({
        api_key: getRequiredCloudinaryEnv('CLOUDINARY_API_KEY'),
        api_secret: getRequiredCloudinaryEnv('CLOUDINARY_API_SECRET'),
        cloud_name: getRequiredCloudinaryEnv('CLOUDINARY_CLOUD_NAME'),
        secure: true
      })
    }

    cloudinaryConfigured = true
  }

  return cloudinary
}

export const getSafeCloudinaryPathSegment = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'unknown'

export const uploadDocumentToCloudinary = ({
  fileBuffer,
  fileName,
  folder,
  mimeType
}: {
  fileBuffer: Buffer
  fileName: string
  folder: string
  mimeType: string
}): Promise<StoredCloudinaryDocument> =>
  new Promise((resolve, reject) => {
    const uploadStream = getCloudinaryClient().uploader.upload_stream(
      {
        context: {
          mime_type: mimeType,
          original_file_name: fileName
        },
        filename_override: fileName,
        folder,
        resource_type: 'auto',
        type: defaultDeliveryType,
        unique_filename: true,
        use_filename: false
      },
      (error, result?: CloudinaryUploadResult) => {
        if (error) {
          reject(error)

          return
        }

        if (!result?.public_id || !result.secure_url) {
          reject(new Error('Cloudinary did not return document upload details.'))

          return
        }

        resolve({
          bytes: result.bytes ?? fileBuffer.length,
          deliveryType: result.type || defaultDeliveryType,
          format: result.format || null,
          publicId: result.public_id,
          resourceType: result.resource_type || defaultResourceType,
          secureUrl: result.secure_url
        })
      }
    )

    uploadStream.end(fileBuffer)
  })

export const deleteCloudinaryDocument = async ({
  deliveryType,
  publicId,
  resourceType
}: {
  deliveryType?: string | null
  publicId?: string | null
  resourceType?: string | null
}) => {
  if (!publicId) return

  await getCloudinaryClient().uploader.destroy(publicId, {
    invalidate: true,
    resource_type: resourceType || defaultResourceType,
    type: deliveryType || defaultDeliveryType
  })
}

export const getCloudinaryDocumentDownloadUrl = ({
  deliveryType,
  expiresInSeconds = 60,
  fileName,
  format,
  publicId,
  resourceType
}: {
  deliveryType?: string | null
  expiresInSeconds?: number
  fileName?: string | null
  format?: string | null
  publicId: string
  resourceType?: string | null
}) => {
  const fileNameExtension = fileName?.includes('.') ? fileName.split('.').pop() : null
  const publicIdExtension = publicId.includes('.') ? publicId.split('.').pop() : null
  const normalizedFormat = (format || fileNameExtension || publicIdExtension || 'bin').replace(/^\./, '')

  return getCloudinaryClient().utils.private_download_url(publicId, normalizedFormat, {
    attachment: false,
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    resource_type: resourceType || defaultResourceType,
    type: deliveryType || defaultDeliveryType
  })
}
