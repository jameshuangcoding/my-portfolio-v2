export interface Project {
  title: string;
  description: string;
  link: string;
  image: string;
}

export const projects: Project[] = [
  {
    title: 'EtherTrack',
    description: 'DeFi portfolio tracker for Ethereum wallet assets',
    link: 'https://ethertrack1.vercel.app/',
    image: '/ethertrack.png',
  },
  {
    title: 'RaceFetch',
    description:
      'Discord Bot for fetching NYRR current race and volunteer calendar',
    link: '',
    image: '/racefetch.png',
  },
  {
    title: 'Clearview',
    description: 'Tool for detecting types of chest cancer based on CT scans',
    link: 'https://www.kaggle.com/code/jameshuangcoding/chest-cancer-ct-scan-detector',
    image: '/clearview.png',
  },
  {
    title: 'Alley',
    description: 'Web app for locating tennis courts',
    link: 'https://github.com/Stab-Rabbit-NYOI7/tennis-mapper',
    image: '/alley.png',
  },
  {
    title: 'Memo',
    description: 'Web app that assists in vocabulary memorization.',
    link: 'https://github.com/NYOI7-Study-Cards-Scratch-Project/study-cards/',
    image: '/memo.png',
  },
  {
    title: "What's Above Me?",
    description:
      "Web app for tracking what's in the sky, including planes, stars, and much more.",
    link: 'https://github.com/NYOI7-Mewtwo/whats-above-me',
    image: '/whats-above-me.png',
  },
  {
    title: 'jameshuang.dev (v1)',
    description: 'Current portfolio site built with Next.js',
    link: 'https://github.com/jameshuangcoding/my-portfolio',
    image: '/portfolio-v1.png',
  },
];
