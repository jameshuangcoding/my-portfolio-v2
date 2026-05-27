import type { Metadata } from 'next';
import { Fraunces, Newsreader } from 'next/font/google';
import './globals.css';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'James Huang',
  description: 'My Portfolio v2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${fraunces.variable} ${newsreader.variable} bg-light-primary dark:bg-dark-primary min-h-screen`}>
        <div className='relative min-h-screen flex flex-col md:flex-row'>
          <NavBar />
          <div className='flex-1 flex flex-col min-h-screen'>
            <main className='flex-1 w-full max-w-2xl px-5 md:px-10 lg:px-16 pt-6 md:pt-24 pb-10'>
              {children}
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
