export interface Project {
  title: string;
  description: string;
  link: string;
}

export const projects: Project[] = [
  {
    title: 'EtherTrack',
    description: 'DeFi portfolio tracker for Ethereum wallet assets',
    link: 'https://ethertrack1.vercel.app/',
  },
  {
    title: 'RaceFetch',
    description:
      'Discord Bot for fetching NYRR current race and volunteer calendar',
    link: '',
  },
  {
    title: 'Clearview',
    description: 'Tool for detecting types of chest cancer based on CT scans',
    link: 'https://www.kaggle.com/code/jameshuangcoding/chest-cancer-ct-scan-detector',
  },
  {
    title: 'Alley',
    description: 'Web app for locating tennis courts',
    link: 'https://github.com/Stab-Rabbit-NYOI7/tennis-mapper',
  },
  {
    title: 'Memo',
    description: 'Web app that assists in vocabulary memorization.',
    link: 'https://github.com/NYOI7-Study-Cards-Scratch-Project/study-cards/',
  },
  {
    title: "What's Above Me?",
    description:
      "Web app for tracking what's in the sky, including planes, stars, and much more.",
    link: 'https://github.com/NYOI7-Mewtwo/whats-above-me',
  },
  {
    title: 'jameshuang.dev (v1)',
    description: 'Previous version 1 of portfolio site',
    link: 'https://github.com/jameshuangcoding/my-portfolio',
  },
];
