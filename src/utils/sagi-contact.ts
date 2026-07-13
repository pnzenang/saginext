export const sagiPhoneDisplay = '(804) 214-6390'
export const sagiPhoneHref = 'tel:+1-804-214-6390'

export type SagiWhatsAppContact = {
  display: string
  id: string
  label: string
  phone: string
}

export const sagiWhatsAppContacts = [
  {
    display: '+1 (913) 999-5401',
    id: 'main',
    label: 'SAGI WhatsApp',
    phone: '19139995401'
  }
] as const satisfies readonly SagiWhatsAppContact[]

export const getSagiWhatsAppUrl = (message: string, phone = sagiWhatsAppContacts[0].phone) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
