import { PrismaClient } from '@prisma/client'
declare global {
  var __prisma: PrismaClient
}
if (!global.__prisma) {
  global.__prisma = new PrismaClient()
}
try {
  global.__prisma.$connect()
}
catch (err) {
  console.error('Unable to connect to the database:', err)
}
export const prisma = global.__prisma
