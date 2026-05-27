import Link from 'next/link';
import { Experience } from '../data/experiences';

const ExperienceRow = ({ exp }: { exp: Experience }) => {
  return (
    <Link href={exp.link} className='group block'>
      <div className='flex flex-row gap-4 md:gap-6 border-t border-gray-200 dark:border-gray-700 py-3'>
        <span className='w-20 md:w-24 shrink-0 pt-0.5 text-[length:var(--step--1)] font-sans text-gray-500 dark:text-gray-400 tabular-nums'>
          {exp.time}
        </span>
        <div className='min-w-0'>
          <h3 className='text-[length:var(--step-0)] font-sans font-medium text-gray-900 dark:text-gray-50 group-hover:text-light-tertiary dark:group-hover:text-dark-tertiary transition-colors'>
            {exp.company}
          </h3>
          <p className='text-[length:var(--step--1)] font-sans text-gray-500 dark:text-gray-400'>
            {exp.team}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceRow;
