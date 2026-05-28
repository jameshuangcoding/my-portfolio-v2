import Link from 'next/link';
import { links } from '../data/links';

const About = () => {
  const paragraphStyle = 'text-[length:var(--step-0)] leading-[1.7]';

  return (
    <div className='stagger text-gray-900 dark:text-gray-50 font-sans flex flex-col gap-4'>
      <header className='mb-2'>
        <h1 className='font-display text-[length:var(--step-4)] leading-[1.05] font-medium tracking-tight'>
          James Huang
        </h1>
        <p className='font-display italic text-[length:var(--step-1)] text-light-tertiary dark:text-dark-tertiary mt-1'>
          software engineer
        </p>
      </header>

      <p className={paragraphStyle}>
        I&apos;m James, a full-stack engineer most recently at{' '}
        <Link
          href='https://www.verygoodsecurity.com/'
          className='text-light-tertiary dark:text-dark-tertiary hover:underline transition-colors duration-200'
        >
          VGS
        </Link>{' '}
        focused on improving developer velocity through CI/CD pipeline
        modernization by eliminating frustrating infrastructure so engineers
        could build and ship with ease. Before that, I worked at early-stage
        startups building tools for fintech and the open source community.
      </p>

      <p className={paragraphStyle}>
        My interests span backend systems, DevOps and machine learning and
        I&apos;m currently deepening my AI/ML foundations through my
        Master&apos;s in CS at Georgia Tech. Long term, I&apos;m interested in
        working at the intersection of all three, specifically MLOps and AI
        infrastructure.
      </p>

      <p className={paragraphStyle}>
        Outside of work and school, I&apos;m usually training for my next
        marathon, cooking food from scratch, or traveling the world. Feel free
        to reach out through the links below.
      </p>

      <nav className='flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-[length:var(--step--1)]'>
        {links.map((link) => {
          const external = link.path.startsWith('http');
          return (
            <Link
              key={link.name}
              href={link.path}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className='text-gray-500 dark:text-gray-400 hover:text-light-tertiary dark:hover:text-dark-tertiary underline underline-offset-4 decoration-gray-300 dark:decoration-gray-600 hover:decoration-current transition-colors'
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default About;
