import { auth } from '@clerk/nextjs/server'

import db from '@/utils/db'

export const dynamic = 'force-dynamic'

const getSafeDownloadFileName = (fileName: string) => fileName.replace(/[^\w.\- ()]/g, '_').slice(0, 180) || 'document'

export const GET = async (_request: Request, { params }: { params: Promise<{ documentId: string }> }) => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { documentId } = await params

  const document = await db.deceasedMemberDocument.findUnique({
    select: {
      clerkId: true,
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

  if (userId !== process.env.ADMIN_USER_ID && document.clerkId !== userId) {
    return new Response('Forbidden', { status: 403 })
  }

  return new Response(document.fileData, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${getSafeDownloadFileName(document.fileName)}"`,
      'Content-Length': String(document.fileSize),
      'Content-Type': document.mimeType || 'application/octet-stream'
    }
  })
}
