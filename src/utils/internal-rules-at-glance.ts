export type InternalRulesAtGlanceSection = {
  title: string
  summary: string
  bullets: string[]
}

export const internalRulesDownloadFileName = 'InternalRules.pdf'

export const internalRulesAtGlance: InternalRulesAtGlanceSection[] = [
  {
    title: 'Purpose and Objectives',
    summary: 'SAGI is organized to reduce the burden families face after losing a member.',
    bullets: [
      'Maintain an electronic database of associations organized in the United States.',
      'Share death information with presidents and delegates of member associations.',
      'Facilitate repatriation or burial services for eligible affiliated members.',
      'Collect contributions from member associations and coordinate eligible support.',
      'Transfer support to the funeral home and any remaining balance to the beneficiary after administrative costs.'
    ]
  },
  {
    title: 'Governance and Meetings',
    summary: 'SAGI operates through officers, the Bureau/Board, and the General Assembly.',
    bullets: [
      'Officers and the Bureau/Board support day-to-day organization and rule administration.',
      'The Bureau/Board determines the place, date, and time of the General Assembly.',
      'The Bureau/Board may meet periodically to review whether SAGI is operating within its mission.',
      'When a death is reported, the Bureau may announce the death, validate it, and create the contribution table.'
    ]
  },
  {
    title: 'Membership and Good Standing',
    summary: 'Associations, not individual members directly, are members of SAGI.',
    bullets: [
      'Eligible associations are composed of people living in the United States.',
      'Associations must remain in good standing, including payment of SAGI fees and contributions.',
      'Individual association members do not have standing to demand accounting or challenge SAGI operations directly.',
      'SAGI may accept or decline an association membership request at its discretion.',
      'Members with at least ten years of active membership may retain membership worldwide, subject to the benefit rules.'
    ]
  },
  {
    title: 'Matriculation and Registration',
    summary: 'A SAGI matriculation number is issued only after the required waiting period and review.',
    bullets: [
      'Matriculation is assigned and published by email after the applicable waiting period.',
      'Associations are responsible for ensuring the same member is not registered twice.',
      'Registration can be submitted at any time through the SAGI web application.',
      'Member names must match official documents such as an ID or passport.',
      'Documents, name changes, and corrections are not accepted after a death announcement.'
    ]
  },
  {
    title: 'List Updates and Delegate Duties',
    summary: 'Member list changes should be completed through the SAGI web application and official forms.',
    bullets: [
      'Additions, withdrawals, transfers, contact changes, and name corrections should be handled in the dashboard or required SAGI forms.',
      'Delegates should not use email replies to submit forms because doing so may delay processing.',
      'Withdrawals should be submitted before the contribution table is created.',
      'Delegates must keep names, emails, and phone numbers current for each association contact.'
    ]
  },
  {
    title: 'Withdrawals, Name Corrections, and Transfers',
    summary: 'Certain member changes require formal proof or approval by the involved delegates.',
    bullets: [
      'Withdrawals are performed by the association or delegate in the SAGI dashboard.',
      'Name corrections require Form S4 and supporting documents for divorce, marriage, or court-ordered name changes.',
      'Transfers require the delegates of the involved associations to recommend the same transfer.',
      'A transfer cannot proceed unless both delegates complete the required transfer steps.'
    ]
  },
  {
    title: 'Fraud, Sanctions, and SAGI Identification',
    summary: 'False information and misuse of SAGI identification can lead to discipline or exclusion.',
    bullets: [
      'Fraud includes false statements, falsified documents, and holding a SAGI matriculation number while not residing in the United States.',
      'The Bureau/Board may issue a caution or penalty based on the circumstances.',
      'Fraud may result in termination of the individual membership and exclusion of the member association from SAGI.',
      'SAGI ID cards, names, and matriculation numbers may not be used for political, social, or economic purposes outside SAGI.'
    ]
  },
  {
    title: 'Claims, Forum, and Attorney Fees',
    summary: 'The rules limit who may challenge SAGI operations and where disputes are handled.',
    bullets: [
      'Member associations may challenge operations through the General Assembly or proper legal forum.',
      'Individual members of member associations do not have the same direct right to challenge SAGI operations.',
      'The exclusive forum is generally Montgomery County, Maryland, or the District of Maryland when federal jurisdiction applies.',
      'If SAGI prevails in litigation or similar proceedings, SAGI may recover reasonable attorney fees from the non-prevailing party.'
    ]
  },
  {
    title: 'Death Announcement and Documentation',
    summary: 'Death documentation depends on whether the death occurred inside or outside the United States.',
    bullets: [
      'For a death in the United States, required documents include a death certificate, SAGI matriculation number, photo of the deceased, government picture ID, funeral home invoice, and proof the association is in good standing.',
      'The cause of death may be redacted before documents are sent to SAGI.',
      'For a death outside the United States, additional proof may include consular death records, passport or visa pages, and evidence of the trip date.',
      'Documents submission deadline is set to 180 days after the passing of the member.',
      'SAGI does not issue death certificates and does not keep medical records for families.'
    ]
  },
  {
    title: 'Contributions and Eligibility',
    summary: 'Contribution support depends on active membership length, death location, timing, and good standing.',
    bullets: [
      'All active member associations contribute when an eligible death is announced.',
      'Contribution amounts change based on active membership duration and how quickly the death is reported to SAGI.',
      'The highest listed support is available only when eligibility, timing, location, and good-standing rules are satisfied.',
      'Support may be reduced or denied for waiting-period deaths, missing matriculation, non-payment, name mismatch, certain travel dates, lack of required U.S. residency documents, or body donation for research.'
    ]
  },
  {
    title: 'Contribution Payment and Disbursement',
    summary: 'Payments must match the contribution list and support is disbursed through formal channels.',
    bullets: [
      'Associations should pay the exact amount listed on the contribution list.',
      'Contributions may be sent through the provided SAGI payment methods, including Zelle to Active Solidarity Ltd.',
      'Delegates should record deposits in SAGI after payment is made.',
      'Eligible support is paid to the funeral home and any remaining balance is issued to the beneficiary.',
      'Beneficiary payments are not provided in cash.'
    ]
  },
  {
    title: 'Penalties, Fees, and Rule Changes',
    summary:
      'Late payments, administration fees, matriculation fees, and amendments are governed by the internal rules.',
    bullets: [
      'An association that misses the contribution due date may owe a late fee of $100.00 plus missed contributions.',
      'Associations that remain unpaid may be excluded from the next contribution and may be excluded from SAGI.',
      'Administration fees and matriculation fees are non-refundable.',
      'The Internal Rules and Regulations may be amended by the SAGI Bureau/Board and distributed to presidents and delegates by email.'
    ]
  }
]
