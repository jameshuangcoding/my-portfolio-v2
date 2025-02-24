import ExperienceRow from "./ExperienceRow";
import { experiences } from "../data/experiences";

const Experience = () => {

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
