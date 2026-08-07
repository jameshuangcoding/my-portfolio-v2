'use client';

import Map from '@/Map';

const Life = () => {
  return (
    <div className='stagger text-gray-900 dark:text-gray-50'>
      <h1 className='font-display text-[length:var(--step-3)] mb-2 font-medium tracking-tight'>
        Life
      </h1>
      <div className='w-full aspect-[16/9] max-h-[70vh] overflow-hidden rounded-lg'>
        <Map />
      </div>
    </div>
  );
};

export default Life;
