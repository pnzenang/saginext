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

const contributionTableDocumentTypes = [
  'death_certificate',
  'deceased_picture',
  'ministry_certified_death_certificate'
]

export const GET = async (_request: Request, { params }: { params: Promise<{ documentId: string }> }) => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { documentId } = await params

  const document = await db.deceasedMemberDocument.findUnique({
    select: {
      cloudinaryDeliveryType: true,
      cloudinaryFormat: true,
      cloudinaryPublicId: true,
      cloudinaryResourceType: true,
      clerkId: true,
      documentType: true,
      status: true,
      deceasedMember: {
        select: {
          clerkId: true,
          memberMatriculationNumber: true
        }
      },
      fileData: true,
      fileName: true,
      fileSize: true,
      mimeType: true
    },
    where: {
      id: documentId
    }
  })

  if (!document) {
    return new Response('Document not found', { status: 404 })
  }

  const isDocumentOwner = document.clerkId === userId
  const isDeathAnnouncementOwner = document.deceasedMember.clerkId === userId
  const isAdminUser = userId === process.env.ADMIN_USER_ID

  const isContributionTableDocument =
    document.status === 'approved' && contributionTableDocumentTypes.includes(document.documentType)

  const currentPublishedContributionTable = isContributionTableDocument
    ? await db.associationContributionAssessment.findFirst({
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          deaths: {
            select: {
              id: true
            },
            take: 1,
            where: {
              memberMatriculationNumber: document.deceasedMember.memberMatriculationNumber
            }
          }
        },
        where: {
          deaths: {
            some: {}
          }
        }
      })
    : null

  const isCurrentContributionTableDocument = Boolean(currentPublishedContributionTable?.deaths.length)

  if (!isAdminUser && !isDocumentOwner && !isDeathAnnouncementOwner && !isCurrentContributionTableDocument) {
    return new Response('Forbidden', { status: 403 })
  }

  const headers = getDownloadHeaders({
    fileName: document.fileName,
    fileSize: document.fileSize,
    mimeType: document.mimeType
  })

  if (document.cloudinaryPublicId) {
    const downloadUrl = getCloudinaryDocumentDownloadUrl({
      deliveryType: document.cloudinaryDeliveryType,
      fileName: document.fileName,
      format: document.cloudinaryFormat,
      publicId: document.cloudinaryPublicId,
      resourceType: document.cloudinaryResourceType
    })

    const cloudinaryResponse = await fetch(downloadUrl, { cache: 'no-store' })

    if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
      return new Response('Document file is unavailable', { status: 502 })
    }

    return new Response(cloudinaryResponse.body, { headers })
  }

  if (!document.fileData) {
    return new Response('Document file is missing', { status: 404 })
  }

  return new Response(document.fileData, {
    headers
  })
}
