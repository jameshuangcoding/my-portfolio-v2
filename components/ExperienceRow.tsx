import Link from 'next/link';
import { Experience } from '../data/experiences';
import Image from 'next/image';

const ExperienceRow = ({ exp }: { exp: Experience }) => {
  return (
    <Link href={exp.link} className='group'>
      <div className='flex flex-row justify-between items-center border-t border-dashed border-gray-200 dark:border-gray-700 py-1 hover:bg-gray-50 dark:hover:bg-dark-accent transition-colors'>
        <div className='flex flex-row items-center gap-2'>
          <Image
            src={exp.icon}
            alt={exp.company}
            width={25}
            height={25}
            className='dark:bg-white dark:p-[2px] rounded-sm transition-transform group-hover:scale-110'
          />
          <h3 className='text-xs md:text-sm lg:text-md xl:text-lg font-sans font-medium text-gray-900 dark:text-gray-50 group-hover:text-light-tertiary dark:group-hover:text-dark-tertiary transition-colors'>
            {exp.company}
          </h3>
          <p className='text-xs md:text-sm lg:text-md xl:text-lg font-sans text-gray-500 dark:text-gray-400'>
            {exp.team}
          </p>
        </div>
        <div>
          <p className='text-xs md:text-sm lg:text-md xl:text-lg font-sans text-gray-700 dark:text-gray-300'>
            {exp.time}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceRow;
