import { FaLinkedin } from 'react-icons/fa';
import { IoLogoGithub } from 'react-icons/io';
import { IoIosMail } from 'react-icons/io';
import { FaFileContract } from 'react-icons/fa6';

export interface Link {
  path: string;
  icon: React.ReactNode;
}

export const links: Link[] = [
  {
    path: 'https://www.linkedin.com/in/jameshuang07/',
    icon: <FaLinkedin />,
  },
  {
    path: 'https://github.com/jameshuangcoding',
    icon: <IoLogoGithub />,
  },
  {
    path: 'mailto:jhuang4647@gmail.com',
    icon: <IoIosMail />,
  },
  {
    path: 'resume.pdf',
    icon: <FaFileContract />,
  },
];
