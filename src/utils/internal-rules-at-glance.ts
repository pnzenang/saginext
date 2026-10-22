export type InternalRulesAtGlanceSection = {
  title: string
  summary: string
  bullets: string[]
}

export const internalRulesDownloadFileName = 'SAGI Internal Rules.pdf'

// Summary of the SAGI Internal Rules & Regulations, Last Revised Jul 1, 2026 (src/content/documents/SAGI Internal Rules.pdf).
export const internalRulesAtGlance: InternalRulesAtGlanceSection[] = [
  {
    title: 'Purpose and Objectives',
    summary:
      'Active Solidarity Ltd. (SAGI) is a network of people living in the United States that helps families with the financial burden of losing a loved one.',
    bullets: [
      'Maintain an electronic database of associations organized in the United States.',
      'Inform presidents and delegates of member associations when an individual member dies.',
      'Facilitate the repatriation of remains or burial of eligible individual members.',
      'Collect contributions (donations) from each member association.',
      'Pay the funeral home, and pay any balance to the beneficiary after administrative costs.'
    ]
  },
  {
    title: 'Governance and Meetings',
    summary: 'SAGI operates through its officers, the Bureau/Board of Directors, and the General Assembly.',
    bullets: [
      'Officers are a President, Vice President(s), Secretary-General(s), a Treasurer, and an Auditor, co-opted by the Founding Members and approved by the Bureau/Board.',
      'The Bureau/Board decides the location and time of the General Assembly; presidents and delegates should attend.',
      'The Bureau/Board meets at least three (3) times a year, and the President may summon an emergency meeting.',
      'Within 48 hours of a death announcement, the Bureau/Board meets to announce the death, verify the documents, and send out the contribution table.'
    ]
  },
  {
    title: 'Membership and Good Standing',
    summary: 'Only associations can be members of SAGI. Membership is free and voluntary.',
    bullets: [
      'Member associations must be composed of people living in the United States and must follow these Internal Rules.',
      'Associations receive contributions only while in good standing, including payment of administration and registration fees.',
      'Individual members cannot make claims or raise issues with SAGI; only associations in good standing can.',
      'Membership becomes active once a SAGI matriculation number is assigned and published by email.',
      'Members with 10 years of membership can keep it worldwide with proof of U.S. citizenship or permanent residency; a special contribution amount applies if they die in their country of origin.'
    ]
  },
  {
    title: 'Matriculation and Registration',
    summary: 'New members are registered by the delegate on www.mySagi.org and wait at least 90 days.',
    bullets: [
      'Matriculation numbers are assigned and published at least ninety (90) days after a new registration.',
      'An association may not have two matriculation numbers; its president or delegate must prevent duplicate registration.',
      'Names and dates of birth must match official documents exactly, without abbreviations.',
      'Name changes or corrections for a deceased member are not accepted after the death announcement.',
      'Returning members and associations pay all missed contributions plus a return fee, then wait 90 days.'
    ]
  },
  {
    title: 'List Updates and Delegate Duties',
    summary: 'Additions, withdrawals, and transfers are done in the delegate dashboard on www.mySagi.org.',
    bullets: [
      'Name corrections, name changes, and contact updates use Forms S4 and S6, downloaded from www.mySagi.org.',
      'Submit forms in a fresh email, not as a reply, to avoid delays.',
      'New individual members pay their administration and registration fees within 60 days of registration.',
      'Withdrawals take effect by the next contribution table and do not change a contribution already in progress.',
      'The cutoff for the next contribution is between the 5th and 8th of each month.'
    ]
  },
  {
    title: 'Name Corrections, Transfers, and Contacts',
    summary: 'Some member changes need supporting documents or both delegates’ agreement.',
    bullets: [
      'Name corrections (Form S4) are for minor errors such as typos.',
      'A name change requires a divorce decree, marriage certificate, or court order.',
      'A transfer needs both delegates to recommend the same member in their dashboards.',
      'Delegates should answer transfer requests within 2 weeks; after that, the SAGI Bureau may proceed with the transfer.',
      'Contact updates use Form S6 and include each delegate’s email and phone number.'
    ]
  },
  {
    title: 'Fraud, Sanctions, and SAGI Identification',
    summary: 'False information and misuse of SAGI identification can lead to penalties or exclusion.',
    bullets: [
      'Fraud includes holding a SAGI matriculation number while not living in the United States, falsified documents, and false statements.',
      'The Bureau/Board may give a caution or a penalty, depending on the circumstances.',
      'Offenses meant to disrupt SAGI end the offender’s membership; detected fraud excludes the individual and/or association.',
      'SAGI ID cards belong to SAGI. SAGI names, matriculation numbers, emails, and phone numbers may not be used for political or economic purposes.'
    ]
  },
  {
    title: 'Claims, Forum, and Attorney Fees',
    summary: 'Only member associations may challenge SAGI’s operations, and disputes are heard in Maryland.',
    bullets: [
      'Only member associations have a right to accounting or to challenge SAGI’s operations and funds, in court or through the General Assembly.',
      'Individual members of associations have no such right.',
      'The exclusive forum is the Circuit Court for Montgomery County, Maryland, or the federal district court for the District of Maryland.',
      'When SAGI prevails in litigation or arbitration, the other party pays SAGI’s reasonable attorney fees.'
    ]
  },
  {
    title: 'Death Announcement and Documentation',
    summary:
      'Report a death by email within 7 days for the full contribution; the documents required depend on where the death occurred.',
    bullets: [
      'Reporting a death after 7 days reduces the contribution, and the later it is reported, the lower it is. No documents are needed to report a death.',
      'Death in the U.S.: death certificate (cause of death may be redacted), matriculation number, picture of the deceased, government picture ID, funeral home invoice, funeral program, and proof of good standing.',
      'Death outside the U.S. (U.S. citizen or permanent resident visiting a country, trip started on or after May 1, 2024, death within 180 days of arriving): death certificate certified by that country’s Ministry of External Relations, proof the death was reported to Social Security (Consular Report of Death), green card and passport or U.S. passport with the visa page and trip ticket(s) showing the trip began no more than 180 days before the death, a picture of the deceased, and the funeral program.',
      'The family has 180 days after the date of death to provide the required documents; after that, documents are no longer accepted.',
      'SAGI does not handle family paperwork and does not keep records of deaths.'
    ]
  },
  {
    title: 'Contributions and Eligibility',
    summary:
      'The contribution amount depends on active membership length, where the death occurred, and how quickly it was reported.',
    bullets: [
      'All active member associations contribute, even for deaths that occurred before their matriculation.',
      'The amount grows with the member’s length of active membership: under 180 days, 180–359 days, and 360 days or more.',
      'Different amounts apply when a U.S. passport or green card holder dies in their country of origin. See the contribution tables in section 17.2 of the PDF for exact amounts.',
      'No contribution for deaths during the waiting period. Contributions are denied for associations not in good standing, a name mismatch with the death certificate, travel that began before May 1, 2024, no U.S. permanent residency documents, or a body donated for research.',
      'The amount cannot change after the contribution table is sent out.'
    ]
  },
  {
    title: 'Contribution Payment and Disbursement',
    summary: 'Pay the exact amount on the contribution list; support is paid to the funeral home and the beneficiary.',
    bullets: [
      'Pay by bank deposit or transfer, or online to info@sagiusa.org, name Active Solidarity Ltd.',
      'Pay the exact amount, including cents: the cents identify your association.',
      'Send the deposit receipt by email after paying.',
      'Families should allow a brief SAGI testimony at the farewell ceremony; otherwise part of their contribution is deducted.',
      'The funeral home is paid by bank transfer or check, and any balance goes to the beneficiary by check, never in cash.'
    ]
  },
  {
    title: 'Penalties, Fees, and Rule Changes',
    summary: 'Late payments, fees, and amendments are set by these Internal Rules.',
    bullets: [
      'A contribution not paid by the due date incurs a late fee.',
      'An association still unpaid 24 hours after the due date is left out of the next contribution and may be excluded from SAGI.',
      'Every individual member pays an administration fee and a one-time registration fee within 60 days of registration. Both are non-refundable.',
      'Returning members pay a return fee plus missed contributions.',
      'The Bureau/Board amends these rules by majority vote and sends them to all presidents and delegates by email.'
    ]
  }
]
