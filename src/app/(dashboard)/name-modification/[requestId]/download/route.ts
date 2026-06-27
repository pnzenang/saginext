import { auth } from '@clerk/nextjs/server'

import db from '@/utils/db'

export const dynamic = 'force-dynamic'

const getSafeDownloadFileName = (fileName: string) => fileName.replace(/[^\w.\- ()]/g, '_').slice(0, 180) || 'document'

export const GET = async (_request: Request, { params }: { params: Promise<{ requestId: string }> }) => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { requestId } = await params

  const request = await db.nameChangeRequest.findUnique({
    select: {
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

  if (!request.fileData || !request.fileName || !request.fileSize) {
    return new Response('Document file is missing', { status: 404 })
  }

  return new Response(request.fileData, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${getSafeDownloadFileName(request.fileName)}"`,
      'Content-Length': String(request.fileSize),
      'Content-Type': request.mimeType || 'application/octet-stream'
    }
  })
}
