import type { SVGAttributes } from 'react'

const InfoIcon = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='25' height='25' viewBox='0 0 25 25' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M23.75 5.46872C23.75 3.13879 21.8612 1.25 19.5312 1.25H5.46875C3.1388 1.25 1.25 3.13879 1.25 5.46873V19.5313C1.25 21.8612 3.1388 23.75 5.46875 23.75H19.5313C21.8612 23.75 23.75 21.8612 23.75 19.5313L23.75 5.46872Z'
        fill='var(--primary)'
      />
      <path
        d='M12.4995 7.13083V7.22664M10.7417 11.3282H13.0855L13.0859 18.3594M19.5312 1.25C21.8612 1.25 23.75 3.13879 23.75 5.46873L23.75 19.5313C23.75 21.8612 21.8612 23.75 19.5313 23.75H5.46875C3.1388 23.75 1.25 21.8612 1.25 19.5313V5.46873C1.25 3.13879 3.1388 1.25 5.46875 1.25H19.5312Z'
        stroke='var(--background)'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default InfoIcon
