'use client';

import { FaMoon, FaRegMoon } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '../data/navlinks';
import { useState, useEffect } from 'react';

const NavBar = () => {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    console.log(
      '%cThanks for poking around the source.',
      'color:#E2531E;font-size:13px;font-weight:600;font-family:Georgia,serif;'
    );
    console.log(
      "%cIf you want to talk shop or you're hiring: jhuang4647@gmail.com",
      'color:#7C7263;font-size:12px;font-family:Georgia,serif;'
    );
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    document.documentElement.classList.toggle('dark', next);
    localStorage.theme = next ? 'dark' : 'light';
    setDarkMode(next);
  };

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <nav
      className='md:sticky md:top-0 md:w-44 lg:w-52 md:shrink-0
      flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start
      gap-4 md:gap-5 px-5 md:px-8 py-5 md:py-24'
    >
      {/* Page links */}
      <ul className='flex flex-row md:flex-col gap-x-5 gap-y-1 flex-wrap'>
        {navLinks.map((navLink) => {
          const active = isActive(navLink.path);
          return (
            <li key={navLink.path} className='font-sans'>
              <Link
                href={navLink.path}
                aria-current={active ? 'page' : undefined}
                className={`group inline-flex items-center gap-2 text-[length:var(--step-0)] transition-colors duration-200
                ${
                  active
                    ? 'text-light-tertiary dark:text-dark-tertiary'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
                }`}
              >
                <span
                  className={`hidden md:inline-block h-px bg-current transition-all duration-300
                  ${active ? 'w-5 opacity-100' : 'w-2 opacity-40 group-hover:w-4 group-hover:opacity-100'}`}
                />
                {navLink.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Theme toggle */}
      <button
        onClick={toggleDarkMode}
        className='text-lg text-gray-500 dark:text-gray-400 hover:text-light-tertiary dark:hover:text-dark-tertiary transition-all duration-200 hover:rotate-12'
        aria-label='Toggle dark mode'
      >
        {mounted ? (darkMode ? <FaRegMoon /> : <FaMoon />) : <FaMoon />}
      </button>
    </nav>
  );
};

export default NavBar;
