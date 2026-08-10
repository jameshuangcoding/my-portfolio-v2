import ExperienceRow from "./ExperienceRow";
import { experiences } from "../data/experiences";

const Experience = () => {

  return (
    <div className="stagger text-gray-900 dark:text-gray-50">
      <h1 className="hidden md:block font-display text-[length:var(--step-3)] mb-6 font-medium tracking-tight">Experience</h1>
      {experiences.map((exp,i) => (
        <ExperienceRow key={i} exp={exp} isFirst={i === 0} />
      ))}
    </div>
  );
};

export default Experience;
