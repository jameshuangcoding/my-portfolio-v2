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
        I&apos;m a software engineer passionate about building tools that
        simplify the complexities of technology. My favorite work involves
        helping people whether it be developers, teams or anyone looking to use
        technology to their advantage.
      </p>

      <p className={paragraphStyle}>
        Currently, I&apos;m a software engineer at{' '}
        <Link
          href='https://www.verygoodsecurity.com/'
          className='text-light-tertiary dark:text-dark-tertiary hover:underline transition-colors duration-200'
        >
          VGS
        </Link>
        , specializing in developer velocity. As part of the Release Team, I
        focus on release reliability and CI/CD optimization, helping engineering
        teams build and ship without spending time fighting legacy pipelines.
      </p>

      <p className={paragraphStyle}>
        I&apos;m also pursuing a Master&apos;s in Computer Science at Georgia
        Tech, focusing on machine learning and artificial intelligence.
        I&apos;m particularly interested in applying AI, backend engineering and
        DevOps to build intelligent systems and the infrastructure to support
        model deployment for real-world impact.
      </p>

      <p className={paragraphStyle}>
        In my spare time, I&apos;m usually climbing rocks, training for my next
        marathon, or playing Teamfight Tactics. Feel free to reach out through
        any of the links below.
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
