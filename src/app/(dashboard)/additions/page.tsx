const MonthlyAdditions = () => {
  return (
    <section>
      <p className='text-muted-foreground mx-auto mb-5 max-w-4xl px-4 text-sm leading-6 sm:text-base'>
        Here, you will see the additions of the month. The month refers to the current monthly membership cycle shown in
        the table. It lists new members who have been added for this month, and it may also include members prepared for
        the next month when their registration is already being processed. This page is for information only, so use it
        to review new additions and confirm names, groups, and dates before checking the contribution table or making
        any payment.
      </p>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vRjLs17xpmqB_mCXD7o0aaHKvXP_5TIrxStmT-iPe6WNFPAb6xlGnXeIPPK2g34HYZxljEMvgoIoQqX/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-160 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default MonthlyAdditions
