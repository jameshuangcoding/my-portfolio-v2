import { projects } from "../utils/projects";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  return (
    <div>
      <h3 className="text-lg mb-4">Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
