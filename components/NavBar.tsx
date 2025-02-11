import { FaMoon } from 'react-icons/fa';
import { FaRegMoon } from 'react-icons/fa';

import Link from 'next/link';
import { links } from '../utils/links';
import { navLinks } from '../utils/navlinks';

const NavBar = () => {
  return (
    <div className='sticky top-0 z-50 bg-white flex flex-col md:flex-row md:justify-between min-w-full py-4'>
      {/* Name */}
      <h1 className='font-bold text-3xl mb-2 md:mb-0'>James Huang</h1>
      
      {/* Navigation Container */}
      <div className='flex flex-col md:flex-row md:items-center gap-4'>
        {/* Nav Links */}
        <ul className='flex gap-4'>
          {navLinks.map((navLink, i) => (
            <li key={i} className='text-md'>
              <Link href={navLink.path}>{navLink.name}</Link>
            </li>
          ))}
        </ul>

        {/* Icon Links and Dark Mode */}
        <ul className='flex gap-4'>
          {/* Icon Links */}
          {links.map((link, i) => (
            <li key={i}>
              <Link href={link.path} className='text-xl'>{link.icon}</Link>
            </li>
          ))}

          {/* Light / Dark Mode Icon */}
          {/* TODO: Add dark mode toggle */}
          <li>
            <FaMoon className='text-xl' />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
