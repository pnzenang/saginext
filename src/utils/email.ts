const resendApiUrl = 'https://api.resend.com/emails'

const emailDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

const registrationPaymentDeadlineDays = 70
const registrationPaymentDeadlineLabel = 'seventy (70) days'

type SendEmailOptions = {
  html: string
  subject: string
  text: string
  to: string | string[]
}

type SendMemberAdditionAcknowledgmentEmailOptions = {
  associationCode: string
  associationName: string
  delegateEmail: string
  memberAddedAt: Date
  memberName: string
  registrationFeeAmount: number
}

type SendDeathAnnouncementAcknowledgmentEmailOptions = {
  associationCode: string
  delegateEmails: string[]
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency'
  }).format(amount)

const normalizeEnvValue = (value?: string) => {
  const trimmedValue = value?.trim()

  if (!trimmedValue) return undefined

  const isWrappedInDoubleQuotes = trimmedValue.startsWith('"') && trimmedValue.endsWith('"')
  const isWrappedInSingleQuotes = trimmedValue.startsWith("'") && trimmedValue.endsWith("'")

  if (isWrappedInDoubleQuotes || isWrappedInSingleQuotes) {
    return trimmedValue.slice(1, -1).trim()
  }

  return trimmedValue
}

const getEmailSender = () => normalizeEnvValue(process.env.SAGI_EMAIL_FROM) ?? normalizeEnvValue(process.env.EMAIL_FROM)

const sendEmail = async ({ html, subject, text, to }: SendEmailOptions) => {
  const apiKey = normalizeEnvValue(process.env.RESEND_API_KEY)
  const from = getEmailSender()

  if (!apiKey || !from) {
    const missingVariables = [!apiKey ? 'RESEND_API_KEY' : null, !from ? 'SAGI_EMAIL_FROM or EMAIL_FROM' : null].filter(
      Boolean
    )

    throw new Error(
      `Email is not configured for ${process.env.VERCEL_ENV ?? 'local'}: missing ${missingVariables.join(', ')}.`
    )
  }

  const response = await fetch(resendApiUrl, {
    body: JSON.stringify({
      from,
      html,
      subject,
      text,
      to
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(`Email provider rejected the message: ${response.status} ${responseText}`)
  }

  try {
    const responseJson = JSON.parse(responseText) as { id?: string }

    console.info('Email sent successfully', {
      environment: process.env.VERCEL_ENV ?? 'local',
      providerMessageId: responseJson.id
    })
  } catch {
    console.info('Email sent successfully', {
      environment: process.env.VERCEL_ENV ?? 'local'
    })
  }
}

export const sendMemberAdditionAcknowledgmentEmail = async ({
  associationCode,
  associationName,
  delegateEmail,
  memberAddedAt,
  memberName,
  registrationFeeAmount
}: SendMemberAdditionAcknowledgmentEmailOptions) => {
  const registrationDeadline = new Date(memberAddedAt)

  registrationDeadline.setDate(registrationDeadline.getDate() + registrationPaymentDeadlineDays)

  const feeAmount = formatCurrency(registrationFeeAmount)
  const formattedDeadline = emailDateFormatter.format(registrationDeadline)
  const delegateLabel = `${associationCode} Delegate`
  const safeAssociationName = escapeHtml(associationName)
  const safeDelegateLabel = escapeHtml(delegateLabel)
  const safeFeeAmount = escapeHtml(feeAmount)
  const safeMemberName = escapeHtml(memberName)
  const safeRegistrationDeadline = escapeHtml(formattedDeadline)

  await sendEmail({
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hello ${safeDelegateLabel},</p>
        <p>
          Thank you for adding <strong>${safeMemberName}</strong> to ${safeAssociationName}.
          This addition helps grow the SAGI family.
        </p>
        <p>
          The next step in the registration is to send the <strong>${safeFeeAmount}</strong>
          registration fee within ${registrationPaymentDeadlineLabel}.
        </p>
        <p>
          <strong>Registration payment deadline:</strong> ${safeRegistrationDeadline}
        </p>
        <p>Thank you,<br />SAGI</p>
      </div>
    `,
    subject: `SAGI member addition received: ${memberName}`,
    text: [
      `Hello ${delegateLabel},`,
      '',
      `Thank you for adding ${memberName} to ${associationName}. This addition helps grow the SAGI family.`,
      '',
      `The next step in the registration is to send the ${feeAmount} registration fee within ${registrationPaymentDeadlineLabel}.`,
      '',
      `Registration payment deadline: ${formattedDeadline}`,
      '',
      'Thank you,',
      'SAGI'
    ].join('\n'),
    to: delegateEmail
  })
}

export const sendDeathAnnouncementAcknowledgmentEmail = async ({
  associationCode,
  delegateEmails
}: SendDeathAnnouncementAcknowledgmentEmailOptions) => {
  const delegateLabel = `${associationCode} Delegates`
  const safeDelegateLabel = escapeHtml(delegateLabel)

  await sendEmail({
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hello ${safeDelegateLabel},</p>
        <p>
          We are deeply saddened by the news of the passing of one of your members.
          Our thoughts and prayers are with your group and the bereaved family.
        </p>
        <p>
          On behalf of the entire SAGI family, please accept our sincere condolences.
        </p>
        <p>
          Please log back in to your dashboard and click on the Death Documentations link
          to upload the necessary documents when they are ready.
        </p>
        <p>Thank you,<br />SAGI</p>
      </div>
    `,
    subject: 'SAGI death announcement received',
    text: [
      `Hello ${delegateLabel},`,
      '',
      'We are deeply saddened by the news of the passing of one of your members. Our thoughts and prayers are with your group and the bereaved family.',
      '',
      'On behalf of the entire SAGI family, please accept our sincere condolences.',
      '',
      'Please log back in to your dashboard and click on the Death Documentations link to upload the necessary documents when they are ready.',
      '',
      'Thank you,',
      'SAGI'
    ].join('\n'),
    to: delegateEmails
  })
}
