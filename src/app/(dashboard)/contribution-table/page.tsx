const ContributionTable = () => {
  return (
    <section>
      <p className='text-muted-foreground mx-auto mb-5 max-w-4xl px-4 text-sm leading-6 sm:text-base'>
        The Contribution Table shows the monthly contribution details for each active case. Use it to review the
        deceased member&apos;s information, the date and place of death, the benefit amount for the family, and the
        amount each group is expected to contribute. Before sending payment, delegates should check the table carefully,
        match the required amount with their group code, and use the table as the official reference for the current
        contribution period.
      </p>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vRoVS4XFshyjUquUn8dxnY23VJJMYsEcHvNtrYDnuaCKs-WsbLaSyvS0YJe-_V9MeycT5mUZCXXuqgO/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-170 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe>
    </section>
  )
}

export default ContributionTable
