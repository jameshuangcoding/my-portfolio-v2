export interface Project {
    title: string;
    description: string;
    link: string;
  }
  
  export const projects: Project[] = [
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
      description: 'Current portfolio site built with Next.js',
      link: 'https://github.com/jameshuangcoding/my-portfolio',
    },
  ];
  