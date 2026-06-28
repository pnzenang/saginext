import { auth } from '@clerk/nextjs/server'

import { getCloudinaryDocumentDownloadUrl } from '@/utils/cloudinary-documents'
import db from '@/utils/db'

export const dynamic = 'force-dynamic'

const getSafeDownloadFileName = (fileName: string) => fileName.replace(/[^\w.\- ()]/g, '_').slice(0, 180) || 'document'

const getDownloadHeaders = ({
  fileName,
  fileSize,
  mimeType
}: {
  fileName: string
  fileSize: number
  mimeType?: string | null
}) => ({
  'Cache-Control': 'private, no-store',
  'Content-Disposition': `attachment; filename="${getSafeDownloadFileName(fileName)}"`,
  'Content-Length': String(fileSize),
  'Content-Type': mimeType || 'application/octet-stream'
})

export const GET = async (_request: Request, { params }: { params: Promise<{ requestId: string }> }) => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { requestId } = await params

  const request = await db.nameChangeRequest.findUnique({
    select: {
      cloudinaryDeliveryType: true,
      cloudinaryFormat: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
      clerkId: true,
      fileData: true,
      fileName: true,
      fileSize: true,
      mimeType: true
    },
    where: {
      id: requestId
    }
  })

  if (!request) {
    return new Response('Document not found', { status: 404 })
  }

  if (userId !== process.env.ADMIN_USER_ID && request.clerkId !== userId) {
    return new Response('Forbidden', { status: 403 })
  }

  if (!request.fileName || !request.fileSize) {
    return new Response('Document file is missing', { status: 404 })
  }

  const headers = getDownloadHeaders({
    fileName: request.fileName,
    fileSize: request.fileSize,
    mimeType: request.mimeType
  })

  if (request.cloudinaryPublicId) {
    const downloadUrl = getCloudinaryDocumentDownloadUrl({
      deliveryType: request.cloudinaryDeliveryType,
      fileName: request.fileName,
      format: request.cloudinaryFormat,
      publicId: request.cloudinaryPublicId,
      resourceType: request.cloudinaryResourceType
    })

    const cloudinaryResponse = await fetch(downloadUrl, { cache: 'no-store' })

    if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
      return new Response('Document file is unavailable', { status: 502 })
    }

    return new Response(cloudinaryResponse.body, { headers })
  }

  if (!request.fileData) {
    return new Response('Document file is missing', { status: 404 })
  }

  return new Response(request.fileData, {
    headers
  })
}
