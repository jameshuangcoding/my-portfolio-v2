'use client';

import Map from '@/Map';

const Life = () => {
  return (
    <div className='stagger flex flex-1 flex-col md:flex-none text-gray-900 dark:text-gray-50'>
      <h1 className='hidden md:block font-display text-[length:var(--step-3)] mb-2 font-medium tracking-tight'>
        Life
      </h1>
      <div className='relative w-full flex-1 min-h-0 overflow-hidden rounded-lg md:flex-none md:aspect-[16/9] md:max-h-[70vh]'>
        <Map />
      </div>
    </div>
  );
};

export default Life;
