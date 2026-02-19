import Link from 'next/link';
import { Button } from '../ui/button';
import Image from 'next/image';
const image =
  'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1719764498/newLogo_nljmul.svg';

const Logo = () => {
  return (
    <Link href='/'>
      <Image src={image} alt='logo' width={120} height={59} priority />
    </Link>
  );
};
export default Logo;
