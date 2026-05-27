import ExperienceRow from "./ExperienceRow";
import { experiences } from "../data/experiences";

const Experience = () => {

  return (
    <div className="stagger text-gray-900 dark:text-gray-50">
      <h1 className="font-display text-[length:var(--step-3)] mb-6 font-medium tracking-tight">Experience</h1>
      {experiences.map((exp,i) => (
        <ExperienceRow key={i} exp={exp} />
      ))}
    </div>
  );
};

export default Experience;
