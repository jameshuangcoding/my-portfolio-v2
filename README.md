# huangjames.dev – v2

> A modern, minimalist portfolio website showcasing my work as a software engineer.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## 📋 Overview

This is the second iteration of my personal portfolio website, built with modern web technologies and designed with a focus on simplicity, performance, and user experience. The site features a clean, professional design with smooth animations and full dark mode support.

## ✨ Features

- **🌓 Dark Mode** - System preference detection with manual toggle
- **🎨 Modern Design** - Clean, minimalist interface with neon orange accents
- **📱 Fully Responsive** - Optimized for mobile, tablet, and desktop
- **⚡ Fast Performance** - Built with Next.js 16 and optimized for speed
- **🎭 Smooth Animations** - Subtle hover effects and transitions throughout
- **📸 Project Showcase** - Image-based project cards with detailed descriptions
- **♿ Accessible** - Semantic HTML and ARIA labels for screen readers

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Fonts:** Inter & Plus Jakarta Sans (Google Fonts)
- **Icons:** [React Icons](https://react-icons.github.io/react-icons/)
- **Deployment:** [Vercel](https://vercel.com/) (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/jameshuangcoding/my-portfolio-v2.git
cd my-portfolio-v2
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
my-portfolio-v2/
├── components/          # React components
│   ├── About.tsx       # About section
│   ├── Experience.tsx  # Experience section
│   ├── ExperienceRow.tsx
│   ├── Projects.tsx    # Projects section
│   ├── ProjectCard.tsx
│   ├── NavBar.tsx      # Navigation with dark mode
│   └── Footer.tsx
├── data/               # Data files
│   ├── projects.ts     # Project information
│   ├── experiences.ts  # Work experience
│   ├── links.tsx       # Social links
│   └── navlinks.ts     # Navigation links
├── public/             # Static assets
│   ├── *.png          # Project images
│   └── *.png          # Company icons
├── src/
│   └── app/           # Next.js app directory
│       ├── layout.tsx # Root layout with dark mode
│       ├── page.tsx   # Home page
│       └── globals.css
└── tailwind.config.ts # Tailwind configuration
```


### Color Customization

The site uses a custom color system defined in `tailwind.config.ts`:

- **Primary:** Background colors
- **Secondary:** Secondary backgrounds
- **Tertiary:** Neon orange accent (#FF6B35 light, #FF8C5A dark)
- **Grays:** Text and borders

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

James Huang
- Website: [huangjames.dev](https://huangjames.dev)
- LinkedIn: [linkedin.com/in/jameshuangcoding](https://linkedin.com/in/jameshuangcoding)
- GitHub: [@jameshuangcoding](https://github.com/jameshuangcoding)
- Email: jhuang4647@gmail.com
