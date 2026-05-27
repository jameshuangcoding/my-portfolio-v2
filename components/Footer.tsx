const Footer = () => {
  return (
    <footer className="w-full max-w-2xl px-5 md:px-10 lg:px-16 pb-8 pt-16">
      <p className="text-[length:var(--step--1)] text-gray-500 dark:text-gray-400 font-sans">
        &copy; {new Date().getFullYear()} James Huang
      </p>
    </footer>
  );
};

export default Footer;
