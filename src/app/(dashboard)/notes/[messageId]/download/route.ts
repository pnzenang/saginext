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

export const GET = async (_request: Request, { params }: { params: Promise<{ messageId: string }> }) => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messageId } = await params

  const message = await db.delegateIssueNoteMessage.findUnique({
    select: {
      cloudinaryDeliveryType: true,
      cloudinaryFormat: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
      documentFileName: true,
      documentFileSize: true,
      documentMimeType: true,
      note: {
        select: {
          associationCode: true
        }
      }
    },
    where: {
      id: messageId
    }
  })

  if (!message) {
    return new Response('Document not found', { status: 404 })
  }

  const isAdminUser = userId === process.env.ADMIN_USER_ID

  if (!isAdminUser) {
    const profile = await db.profile.findUnique({
      select: {
        associationCode: true,
        internalRulesAcceptedAt: true
      },
      where: {
        clerkId: userId
      }
    })

    if (!profile?.internalRulesAcceptedAt || profile.associationCode !== message.note.associationCode) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  if (!message.cloudinaryPublicId || !message.documentFileName || !message.documentFileSize) {
    return new Response('Document file is missing', { status: 404 })
  }

  const headers = getDownloadHeaders({
    fileName: message.documentFileName,
    fileSize: message.documentFileSize,
    mimeType: message.documentMimeType
  })

  const downloadUrl = getCloudinaryDocumentDownloadUrl({
    deliveryType: message.cloudinaryDeliveryType,
    fileName: message.documentFileName,
    format: message.cloudinaryFormat,
    publicId: message.cloudinaryPublicId,
    resourceType: message.cloudinaryResourceType
  })

  const cloudinaryResponse = await fetch(downloadUrl, { cache: 'no-store' })

  if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
    return new Response('Document file is unavailable', { status: 502 })
  }

  return new Response(cloudinaryResponse.body, { headers })
}
