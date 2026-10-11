const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

export type ContributionPaymentAmountDetails = {
  amountDue: number
  amountToSend: number
  hasPaymentCode: boolean
  paymentCodeAmount: number
  paymentCodeCents: number | null
  roundedAmountDue: number
}

export const getContributionPaymentCodeCents = (associationCode: string) => {
  const normalizedCode = associationCode.trim().toUpperCase()

  if (!normalizedCode) return 0

  return Array.from(normalizedCode).reduce((hash, character) => {
    return (hash * 33 + character.charCodeAt(0)) % 100
  }, 0)
}

export const normalizeContributionPaymentCodeCents = (codeCents: number) => {
  if (!Number.isInteger(codeCents) || codeCents < 0 || codeCents > 99) {
    throw new Error('Contribution payment code must be between $0.00 and $0.99.')
  }

  return codeCents
}

export const parseContributionPaymentCodeCents = (paymentCode: string) => {
  const normalizedPaymentCode = paymentCode.trim().replace(/^\$/, '')

  if (/^\d{1,2}$/.test(normalizedPaymentCode)) {
    return normalizeContributionPaymentCodeCents(Number(normalizedPaymentCode))
  }

  if (!/^(?:0)?(?:\.\d{1,2})$|^0\.\d{1,2}$/.test(normalizedPaymentCode)) {
    throw new Error('Enter the payment code as $0.00 to $0.99, or as 0 to 99 cents.')
  }

  const paymentCodeAmount = Number(normalizedPaymentCode)

  if (!Number.isFinite(paymentCodeAmount) || paymentCodeAmount < 0 || paymentCodeAmount > 0.99) {
    throw new Error('Contribution payment code must be between $0.00 and $0.99.')
  }

  return normalizeContributionPaymentCodeCents(Math.round(paymentCodeAmount * 100))
}

export const getContributionPaymentAmountDetails = (
  amountDue: number,
  storedPaymentCodeCents?: number | null
): ContributionPaymentAmountDetails => {
  const safeAmountDue = Math.max(amountDue, 0)

  const paymentCodeCents =
    storedPaymentCodeCents === null || storedPaymentCodeCents === undefined
      ? null
      : normalizeContributionPaymentCodeCents(storedPaymentCodeCents)

  const paymentCodeAmount = paymentCodeCents === null ? 0 : roundCurrencyAmount(paymentCodeCents / 100)
  const roundedAmountDue = Math.ceil(safeAmountDue)

  return {
    amountDue: roundCurrencyAmount(safeAmountDue),
    amountToSend: roundCurrencyAmount(roundedAmountDue + paymentCodeAmount),
    hasPaymentCode: paymentCodeCents !== null,
    paymentCodeAmount,
    paymentCodeCents,
    roundedAmountDue
  }
}
