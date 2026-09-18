export const sagiPhoneDisplay = '(443) 531 5852'
export const sagiPhoneHref = 'tel:+1-443-531-5852'

export type SagiWhatsAppContact = {
  display: string
  id: string
  label: string
  phone: string
}

export const sagiWhatsAppContacts = [
  {
    display: '+1 (443) 531-5852',
    id: 'main',
    label: 'SAGI WhatsApp',
    phone: '14435315852'
  }
] as const satisfies readonly SagiWhatsAppContact[]

export const getSagiWhatsAppUrl = (message: string, phone = sagiWhatsAppContacts[0].phone) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
