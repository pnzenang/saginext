import db from '@/utils/db'

export const fetchContributionPaymentCodeCents = async (associationCode: string) => {
  const paymentCode = await db.associationContributionPaymentCode.findUnique({
    select: {
      codeCents: true
    },
    where: {
      associationCode
    }
  })

  return paymentCode?.codeCents ?? null
}

export const fetchContributionPaymentCodeCentsByAssociationCode = async (associationCodes: string[]) => {
  const uniqueAssociationCodes = Array.from(new Set(associationCodes.map(code => code.trim()).filter(Boolean)))

  if (uniqueAssociationCodes.length === 0) return new Map<string, number | null>()

  const paymentCodes = await db.associationContributionPaymentCode.findMany({
    select: {
      associationCode: true,
      codeCents: true
    },
    where: {
      associationCode: {
        in: uniqueAssociationCodes
      }
    }
  })

  const paymentCodesByAssociationCode = new Map<string, number | null>(
    paymentCodes.map(paymentCode => [paymentCode.associationCode, paymentCode.codeCents])
  )

  uniqueAssociationCodes.forEach(associationCode => {
    if (!paymentCodesByAssociationCode.has(associationCode)) {
      paymentCodesByAssociationCode.set(associationCode, null)
    }
  })

  return paymentCodesByAssociationCode
}
