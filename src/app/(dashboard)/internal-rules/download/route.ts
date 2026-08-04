import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

import { auth } from '@clerk/nextjs/server'

import { internalRulesDownloadFileName } from '@/utils/internal-rules-at-glance'

export const dynamic = 'force-dynamic'

const internalRulesPdfPath = join(process.cwd(), 'src/content/documents/Internal-Rules2.pdf')

export const GET = async () => {
  const { userId } = await auth()

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const [file, fileStats] = await Promise.all([readFile(internalRulesPdfPath), stat(internalRulesPdfPath)])

  return new Response(new Uint8Array(file), {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="${internalRulesDownloadFileName}"`,
      'Content-Length': String(fileStats.size),
      'Content-Type': 'application/pdf'
    }
  })
}
