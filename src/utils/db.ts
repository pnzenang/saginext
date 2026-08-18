import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

const getCachedModels = (client: PrismaClient) =>
  (client as unknown as { _runtimeDataModel?: { models?: Record<string, { fields?: { name: string }[] }> } })
    ?._runtimeDataModel?.models

const hasCachedModelField = (client: PrismaClient, modelName: string, fieldName: string) =>
  Boolean(getCachedModels(client)?.[modelName]?.fields?.some(field => field.name === fieldName))

const hasCurrentPrismaDelegates = (client?: PrismaClient) =>
  Boolean(
    client &&
    'associationPaymentLedgerEntry' in (client as unknown as Record<string, unknown>) &&
    'delegateIssueNote' in (client as unknown as Record<string, unknown>) &&
    'delegateIssueNoteMessage' in (client as unknown as Record<string, unknown>) &&
    'deceasedMemberDocument' in (client as unknown as Record<string, unknown>) &&
    'memberTransferRequest' in (client as unknown as Record<string, unknown>) &&
    'nameChangeRequest' in (client as unknown as Record<string, unknown>) &&
    hasCachedModelField(client, 'DelegateIssueNote', 'delegateUnread') &&
    hasCachedModelField(client, 'DelegateIssueNoteMessage', 'authorRole') &&
    hasCachedModelField(client, 'DelegateIssueNoteMessage', 'cloudinaryPublicId') &&
    hasCachedModelField(client, 'DeceasedMember', 'associationCode') &&
    hasCachedModelField(client, 'DeceasedMember', 'originalMemberVestedAt') &&
    hasCachedModelField(client, 'DeceasedMemberDocument', 'cloudinaryPublicId') &&
    hasCachedModelField(client, 'Member', 'vestedAt') &&
    hasCachedModelField(client, 'RemovedMember', 'originalMemberVestedAt') &&
    hasCachedModelField(client, 'NameChangeRequest', 'cloudinaryPublicId') &&
    hasCachedModelField(client, 'MemberTransferRequest', 'receivingAssociationCode')
  )

let prisma = hasCurrentPrismaDelegates(globalForPrisma.prisma) ? globalForPrisma.prisma : undefined

export const getDb = () => {
  if (!prisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL
    })

    prisma = new PrismaClient({
      adapter
    })

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  }

  return prisma
}

const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getDb()
    const value = client[property as keyof PrismaClient]

    return typeof value === 'function' ? value.bind(client) : value
  }
})

export default db
