'use client';

import { FaMoon } from 'react-icons/fa';
import { FaRegMoon } from 'react-icons/fa';
import Link from 'next/link';
import { links } from '../data/links';
import { navLinks } from '../data/navlinks';
import { useState, useEffect } from 'react';

const NavBar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize dark mode based on system preference or localStorage
  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
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
          <ul className='flex gap-4 items-center'>
            {navLinks.map((navLink, i) => (
              <li key={i} className='font-sans text-md'>
                <Link
                  href={navLink.path}
                  className='text-gray-700 dark:text-gray-300 hover:text-light-tertiary dark:hover:text-dark-tertiary transition-colors duration-200 relative inline-block pb-1 group'
                >
                  {navLink.name}
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-light-tertiary dark:bg-dark-tertiary group-hover:w-full transition-all duration-200'></span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Icon Links and Dark Mode */}
          <ul className='flex gap-4 items-center'>
            {/* Icon Links */}
            {links.map((link, i) => (
              <li key={i}>
                <Link
                  href={link.path}
                  className='text-xl text-gray-700 dark:text-gray-300 hover:text-light-tertiary dark:hover:text-dark-tertiary transition-colors duration-200 hover:scale-110 inline-block'
                >
                  {link.icon}
                </Link>
              </li>
            ))}

            {/* Light / Dark Mode Icon */}
            <li className='flex items-center'>
              <button
                onClick={toggleDarkMode}
                className='text-xl text-gray-700 dark:text-gray-300 hover:text-light-tertiary dark:hover:text-dark-tertiary transition-all duration-200 hover:scale-110 hover:rotate-12'
                aria-label='Toggle dark mode'
              >
                <span className='inline-block transition-transform duration-300'>
                  {mounted ? (darkMode ? <FaRegMoon /> : <FaMoon />) : <FaMoon />}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
