/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchProfile } from '@/utils/actions'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FaSquareWhatsapp } from 'react-icons/fa6'
const NavigationInstructions = async () => {
  const user = await fetchProfile()

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='flex flex-col items-center justify-center gap-8 sm:mt-10 sm:flex-row'>
        <Card className='flex flex-col items-center gap-5 p-5 sm:flex-row sm:p-20'>
          <FaSquareWhatsapp className='text-9xl text-green-600' />
          <div className='w-64 sm:w-96'>
            <h1 className='sm:text-2xl'>
              Click on or scan the QR-Code to join the SAGI whatsapp group in order to receive SAGI UPDATES such as
              contribution charts via Whatsapp.
            </h1>
          </div>
        </Card>
        <Link href='https://chat.whatsapp.com/BD21tcO2cX91xY3K7C3ssQ'>
          <Image
            alt='chef'
            src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778147516/Watsapp_lhkanv.svg'
            width={300}
            height={300}
          />
        </Link>
      </div>
      {/* <div className='flex flex-col justify-center gap-3 sm:flex-row'>
        <Link href='https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiUEFUUklDRSIsImFjdGlvbiI6InBheW1lbnQiLCJ0b2tlbiI6IjQ0MzUzMTU4NTIifQ=='>
          <Image
            alt='chef'
            src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'
            width={300}
            height={300}
          />
        </Link>

        <iframe
          // id='JotFormIFrame-261231251869053'
          title='REGISTRATION SUBMISSION'
          allow='geolocation; microphone; camera; fullscreen; payment'
          src='https://form.jotform.com/261231251869053'
          // scrolling='Yes'
          width='750'
          height='300'
        ></iframe>
      </div>

      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vSFr8dHDHdvlX686YnYBjoi1TfPZwiKoZMDj1PkkJId6gdlXD-sKk0B-YI0x4Q_4ta-CXdZTuk7apON/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-120 w-full max-w-19/20 items-center rounded-lg border'
      ></iframe> */}
      <Features featuresList={featuresList} />
    </div>
  )
}

export default NavigationInstructions

import {
  SwatchBookIcon,
  SearchIcon,
  StarIcon,
  SmartphoneIcon,
  LockKeyholeIcon,
  ShieldBanIcon,
  Pencil
} from 'lucide-react'
import {
  BookCheck,
  Cross,
  Navigation,
  SquareUser,
  Trash2,
  UserCog,
  UserPlus,
  FileStack,
  Users,
  Wallet,
  FileCheck,
  WalletCards,
  WalletMinimal,
  CreditCard,
  ArrowRightLeft,
  List,
  Table
} from 'lucide-react'
import Features from '@/components/shadcn-studio/blocks/features-section-01/features-section-01'

const featuresList = [
  {
    icon: UserPlus,
    title: 'Adding Members',
    description:
      'You add new member to your family or group by clicking on Add Member Link in the sidebar and follow the process, read the instruction to avoid delaying the process.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: Users,
    title: 'Seeing All Your Members',
    description:
      'After adding member, you can see him or her in your dashboard when you click on the link All Members, but the member will be pending until their registration is received by the admin.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: Trash2,
    title: 'Removing & Removed Members',
    description:
      'You can remove member from the 16th of the month to the 5th of the next month, any removal during the contribution does not affect the contribution.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: Cross,
    title: 'Death of a Member',
    description:
      'Click on the 3 dots at the end of the member row and select to death announcement, the member need to be vested to be able to be announced dead. No document is needed.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: WalletCards,
    title: 'Member Registration',
    description:
      'After you submit your registration, you need to send the registration fee and fill out form seen after clicking the Registration Payments Link, please follow the instruction.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: Table,
    title: 'Contribution Table',
    description:
      'Here, you will see the names of the new members joining the organization this month or the next month, this not the contribution table, it is just for informational purpose.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: Wallet,
    title: 'Contribution Payment ',
    description:
      'Here we encourage the delegate to record their contribution after they send it, they should also upload their registration as it reduce confusion.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: WalletMinimal,
    title: 'Financial Positions ',
    description:
      'This spreadsheet allow the delegate to see the financial positions of his or her group, if they send more money they will see the difference in from of their group name.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: FileStack,
    title: 'Death Documentations ',
    description:
      'To announce the death, you do not need any documentation, when the document are ready, you should upload them by clicking on the appropriate link: Death Documentations.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: Pencil,
    title: 'Name Change ',
    description:
      'Click the link to initiate the name modification. The error correction does not need any documents but name change requires name change documentations.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: CreditCard,
    title: 'Payment Instructions ',
    description:
      'Here, we give you the payment information to allow you yo send contribution to SAGI, but the zelle QR-code already exists in the payment pages.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: ArrowRightLeft,
    title: 'Transfer ',
    description:
      'Register the member, Select Edit Member details  from the 3 dots and Transfer_In  from Delegate Recommendation if the member is joining your group. or Transfer_out otherwise',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  }
]
