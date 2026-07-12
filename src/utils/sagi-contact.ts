export const sagiPhoneDisplay = '(804) 214-6390'
export const sagiPhoneHref = 'tel:+1-804-214-6390'

const sagiWhatsAppPhone = '19139995401'

export const getSagiWhatsAppUrl = (message: string) =>
  `https://wa.me/${sagiWhatsAppPhone}?text=${encodeURIComponent(message)}`
