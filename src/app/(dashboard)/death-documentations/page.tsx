const DeathDocumentations = () => {
  return (
    <section>
      <p className='text-muted-foreground mx-auto mb-5 max-w-4xl px-4 text-sm leading-6 sm:text-base'>
        Use this page to submit and review death documentation. Death certificate, SAGI membership ID if available,
        clear picture, picture ID, funeral home invoice, and any required out-of-US documents so the case can be matched
        to the correct deceased member and association.
      </p>
      <div className='flex flex-col justify-center gap-3 sm:flex-row'>
        <iframe
          title='DEATH DOCUMENTATION SUBMISSION'
          allow='geolocation; microphone; camera; fullscreen; payment'
          src='https://form.jotform.com/261477283485064'
          width='750'
          height='300'
        ></iframe>
      </div>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vRRX2ObCG9kiobuNV7hXMT7miH7-fil7al2QGhZr1VCySj2vYsnX5rT2j15qcSGrSo4SLg_VAeWeqTD/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-120 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default DeathDocumentations
