import ExperienceRow from "./ExperienceRow";
import { experiences } from "../utils/experiences";

const Experience = () => {
  return (
    <div>
      <h3 className="text-lg mb-4">Experience</h3>
      <div>
        {experiences.map((exp,i) => (
          <ExperienceRow key={i} exp={exp} />
        ))}
      </div>
    </div>
  );
};

export default Experience;
