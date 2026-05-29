const FinancialPositions = () => {
  return (
    <section>
      <p className='text-muted-foreground mx-auto mb-5 max-w-4xl px-4 text-sm leading-6 sm:text-base'>
        The Financial Positions table shows the current financial status of each association. Use it to confirm whether
        an association has paid the required contribution, has an outstanding balance, or has an excess amount available.
        When an association sends more than the required amount, the extra money is recorded in front of that
        association&apos;s name and can be used toward a future contribution. Delegates should review this page after
        payments are processed to make sure their association&apos;s balance is accurate and in good standing.
      </p>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQTxSBP-rezNnO4Io52fsmBmK4auZThKIn3-kgO4-wxYkePrcJ3OkF5W6BQbFmmHCorsKfEN8cdEtlz/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-170 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default FinancialPositions
