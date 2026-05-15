// React Imports
import type { SVGAttributes } from 'react'

const Astronomy = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' {...props}>
      <g clipPath='url(#clip0_28204_51583)'>
        <path
          opacity='0.3'
          d='M17.3655 17.3653C23.2918 11.4389 25.694 4.23242 22.7308 1.26922C19.7676 -1.69399 12.5612 0.708163 6.63478 6.63457C0.708398 12.561 -1.69374 19.7674 1.26945 22.7306C4.23264 25.6938 11.4391 23.2917 17.3655 17.3653Z'
          fill='var(--primary)'
        />
        <path
          opacity='0.3'
          d='M6.63455 17.3654C0.708162 11.439 -1.69398 4.23258 1.26921 1.26938C4.2324 -1.69382 11.4388 0.708331 17.3652 6.63473C23.2916 12.5611 25.6937 19.7676 22.7306 22.7308C19.7674 25.694 12.5609 23.2918 6.63455 17.3654Z'
          fill='var(--primary)'
        />
        <path
          d='M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z'
          fill='var(--primary)'
        />
      </g>
      <defs>
        <clipPath id='clip0_28204_51583'>
          <rect width='24' height='24' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default Astronomy
