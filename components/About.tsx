import Link from "next/link";

const About = () => {
  return (
    <div className='text-gray-900 dark:text-gray-50 font-sans flex flex-col gap-4'>
      <p className='text-xs md:text-sm lg:text-md xl:text-lg'>
        First and foremost, I&apos;m an engineer who builds products and experiences that make people&apos;s lives easier and loves to understand every little detail.
      </p>

      <p className="text-xs md:text-sm lg:text-md xl:text-lg">
        Currently, I&apos;m a software engineer at{' '}
        <Link 
          href="https://www.chickasaw.com/" 
          className="underline decoration-dashed text-gray-900 dark:text-gray-50 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Chickasaw Nation Industries
        </Link>, a company that works in the government sector.
      </p>

      <p className="text-xs md:text-sm lg:text-md xl:text-lg">
        In my spare time, I like to cook, rock climb and run in preparation for my next marathon. 
        Depending on the season, you&apos;ll also catch me snowboarding, playing various park sports (handball, pickleball, etc.), 
        paddling in a{' '}
        <Link 
          href="https://www.dchracing.com/" 
          className="underline decoration-dashed text-gray-900 dark:text-gray-50 hover:text-gray-700 dark:hover:text-gray-300"
        >
          dragon boat
        </Link>, or helping out my lion dance team. I&apos;m also starting to learn tennis this year (&apos;25) too.
      </p>

      <p className='text-xs md:text-sm lg:text-md xl:text-lg'>
        Thanks for stopping by and learning a bit about my professional and personal life!
      </p>

    </div>
  );
};

export default About;
