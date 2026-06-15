import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

let prisma = globalForPrisma.prisma

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
