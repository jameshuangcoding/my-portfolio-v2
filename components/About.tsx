import Link from 'next/link';

const About = () => {
  const paragraphStyle = 'text-xs md:text-sm lg:text-md xl:text-lg';

  return (
    <div className='text-gray-900 dark:text-gray-50 font-sans flex flex-col gap-4'>
      <p className={paragraphStyle}>
        I&apos;m a software engineer passionate about building tools that
        simplify the complexities of technology. My favorite work involves
        helping people whether it be developers, teams or anyone looking to use
        technology to their advantage.
      </p>

      <p className={paragraphStyle}>
        Currently, I&apos;m a software engineer intern at{' '}
        <Link
          href='https://www.verygoodsecurity.com/'
          className='underline decoration-dashed text-gray-900 dark:text-gray-50 hover:text-gray-700 dark:hover:text-gray-300'
        >
          VGS
        </Link>
        , specializing in developer velocity. As part of the Release Team, I
        focus on release reliability and CI/CD optimization, helping engineering
        teams build and ship without spending time fighting legacy pipelines.
      </p>

      <p className={paragraphStyle}>
        I&apos;m also pursuing a Master&apos;s in Computer Science at Georgia
        Tech, focusing on machine learning and artifical intelligence. I&apos;m
        particularly interested in applying AI, backend engineering and DevOps
        to build intelligent systems and the infrastructure to support model
        deployment for real word impact.
      </p>

      <p className={paragraphStyle}>
        In my spare time, I&apos;m using climbing, training for my next
        marathon, or playing Teamfight Tactics (I&apos;m a big fan of games by
        Riot Games).
      </p>
    </div>
  );
};

export default About;
