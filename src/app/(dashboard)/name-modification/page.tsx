const NameModification = () => {
  return (
    <section>
      <p className='text-muted-foreground mx-auto mb-5 max-w-4xl px-4 text-sm leading-6 sm:text-base'>
        Use this page to request a name correction or an official name change for a member. A name correction is for
        small errors in the existing record, such as a misspelled name, missing letter, wrong order of names, or another
        data-entry mistake; this type of correction does not require supporting documents. A name change means the
        member is officially changing from one legal name to another, and it must be supported by a name-change
        documentation.
      </p>
      <div className='flex flex-col justify-center gap-3 sm:flex-row'>
        <iframe
          title='NAME MODIFICATION REQUEST'
          allow='geolocation; microphone; camera; fullscreen; payment'
          src='https://form.jotform.com/261478104424050'
          width='750'
          height='300'
        ></iframe>
      </div>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vRV956mK6mb42_GZ8CRY9u8Ikljij1HWBu-2F6IOVTSV8Gr1iOeGE7fnBtSMasbMY7jE20lVnOKcH40/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-120 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default NameModification
