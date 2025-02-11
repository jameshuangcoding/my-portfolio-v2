import Link from "next/link";

const About = () => {
  return (
    <div className=''>
      <p className='text-xs mb-4'>
        I'm an engineer who builds products and experiences that make people's lives easier.
      </p>

      <p className="text-xs mb-4">
        Currently, I'm a software engineer at <Link href="https://www.chickasaw.com/" className="underline">Chickasaw Nation Industries</Link>, a company that works in the government sector.
      </p>

      <p className="text-xs mb-4">
        In my spare time, I like to cook, rock climb and run in preparation for my next marathon. 
        Depending on the season, you'll also catch me snowboarding, playing various park sports (handball, pickleball, etc.), 
        paddling in a <Link href="https://www.dchracing.com/" className="underline">dragon boat</Link>, or helping out my lion dance team.
      </p>

      <p className="text-xs mb-4">
        Check out some of the highlights in my life!
      </p>
    </div>
  );
};

export default About;
