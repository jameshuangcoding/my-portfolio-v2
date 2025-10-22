import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
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
      <body className={`${inter.variable} ${plusJakarta.variable} bg-light-primary dark:bg-dark-primary min-h-screen`}>
        <div className="relative min-h-screen flex flex-col">
          <div className='flex-1'>
            <NavBar />
            <div className='m-auto max-w-2xl px-4 md:px-6 lg:px-8 xl:px-10'>{children}</div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
