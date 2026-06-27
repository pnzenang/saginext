const resendApiUrl = 'https://api.resend.com/emails'

const emailDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
})

type SendEmailOptions = {
  html: string
  subject: string
  text: string
  to: string
}

type SendMemberAdditionAcknowledgmentEmailOptions = {
  associationName: string
  delegateEmail: string
  delegateName: string
  memberAddedAt: Date
  memberMatriculationNumber: string
  memberName: string
  registrationFeeAmount: number
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

const getEmailSender = () => process.env.SAGI_EMAIL_FROM ?? process.env.EMAIL_FROM

const sendEmail = async ({ html, subject, text, to }: SendEmailOptions) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = getEmailSender()

  if (!apiKey || !from) {
    console.warn('Skipping email send: RESEND_API_KEY and SAGI_EMAIL_FROM or EMAIL_FROM are required.')

    return
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

  if (!response.ok) {
    const responseText = await response.text()

    throw new Error(`Email provider rejected the message: ${response.status} ${responseText}`)
  }
}

export const sendMemberAdditionAcknowledgmentEmail = async ({
  associationName,
  delegateEmail,
  delegateName,
  memberAddedAt,
  memberMatriculationNumber,
  memberName,
  registrationFeeAmount
}: SendMemberAdditionAcknowledgmentEmailOptions) => {
  const registrationDeadline = new Date(memberAddedAt)

  registrationDeadline.setDate(registrationDeadline.getDate() + 60)

  const feeAmount = formatCurrency(registrationFeeAmount)
  const formattedDeadline = emailDateFormatter.format(registrationDeadline)
  const safeAssociationName = escapeHtml(associationName)
  const safeDelegateName = escapeHtml(delegateName)
  const safeFeeAmount = escapeHtml(feeAmount)
  const safeMemberMatriculationNumber = escapeHtml(memberMatriculationNumber)
  const safeMemberName = escapeHtml(memberName)
  const safeRegistrationDeadline = escapeHtml(formattedDeadline)

  await sendEmail({
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hello ${safeDelegateName},</p>
        <p>
          Thank you for adding <strong>${safeMemberName}</strong> to ${safeAssociationName}.
          This addition helps grow the SAGI family.
        </p>
        <p>
          The next step in the registration is to send the <strong>${safeFeeAmount}</strong>
          registration fee within 60 days.
        </p>
        <p>
          <strong>Registration payment deadline:</strong> ${safeRegistrationDeadline}<br />
          <strong>Member matriculation number:</strong> ${safeMemberMatriculationNumber}
        </p>
        <p>Thank you,<br />SAGI</p>
      </div>
    `,
    subject: `SAGI member addition received: ${memberName}`,
    text: [
      `Hello ${delegateName},`,
      '',
      `Thank you for adding ${memberName} to ${associationName}. This addition helps grow the SAGI family.`,
      '',
      `The next step in the registration is to send the ${feeAmount} registration fee within 60 days.`,
      '',
      `Registration payment deadline: ${formattedDeadline}`,
      `Member matriculation number: ${memberMatriculationNumber}`,
      '',
      'Thank you,',
      'SAGI'
    ].join('\n'),
    to: delegateEmail
  })
}
