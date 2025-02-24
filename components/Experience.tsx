'use client'

import { useEffect, useState } from "react";
import ExperienceRow from "./ExperienceRow";
import { experiences } from "../data/experiences";

const Experience = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled on mount
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);

    // Create observer for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setDarkMode(isDark);
        }
      });
    });

    // Start observing the html element for class changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  return (
    <div className="text-gray-900 dark:text-gray-50 mb-4">
      <h3 className="font-display text-lg md:text-xl lg:text-2xl mb-4 font-medium">Experience</h3>
      <div className="">
        {experiences.map((exp,i) => (
          <ExperienceRow key={i} exp={exp} />
        ))}
      </div>
    </div>
  );
};

export default Experience;
