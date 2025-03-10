'use client';

import { FaMoon } from 'react-icons/fa';
import { FaRegMoon } from 'react-icons/fa';
import Link from 'next/link';
import { links } from '../data/links';
import { navLinks } from '../data/navlinks';
import { useState, useEffect } from 'react';

const NavBar = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode based on system preference or localStorage
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setDarkMode(!darkMode);
  };

  return (
    <nav className='sticky top-0 z-10 bg-light-primary dark:bg-dark-primary min-w-full py-4 mb-4 mt-6'>
      <div className='flex flex-col md:flex-row md:justify-between m-auto max-w-2xl px-4 md:px-6 lg:px-8 xl:px-10'>
        {/* Name */}
        <Link href='/' className='font-display font-bold text-3xl mb-2 md:mb-0 text-gray-900 dark:text-gray-50'>
          James Huang
        </Link>
        
        {/* Navigation Container */}
        <div className='flex flex-col md:flex-row md:items-center gap-4'>
          {/* Nav Links */}
          <ul className='flex gap-4'>
            {navLinks.map((navLink, i) => (
              <li key={i} className='font-sans text-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50'>
                <Link href={navLink.path}>{navLink.name}</Link>
              </li>
            ))}
          </ul>

          {/* Icon Links and Dark Mode */}
          <ul className='flex gap-4 items-center'>
            {/* Icon Links */}
            {links.map((link, i) => (
              <li key={i}>
                <Link href={link.path} className='text-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50'>
                  {link.icon}
                </Link>
              </li>
            ))}

            {/* Light / Dark Mode Icon */}
            <li className='flex items-center'>
              <button 
                onClick={toggleDarkMode}
                className='text-xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50'
                aria-label='Toggle dark mode'
              >
                {darkMode ? <FaRegMoon /> : <FaMoon />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
