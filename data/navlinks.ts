export interface NavLink {
  path: string;
  name: string;
}

export const navLinks: NavLink[] = [
  {
    path: '/',
    name: 'About',
  },
  {
    path: '/experience',
    name: 'Experience',
  },
  {
    path: '/projects',
    name: 'Projects',
  },
  {
    path: '/life',
    name: 'Life',
  },
  {
    path: '/writing',
    name: 'Writing',
  },
];
