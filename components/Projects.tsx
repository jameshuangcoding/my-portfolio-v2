import { projects } from "../data/projects";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  return (
    <div className="text-gray-900 dark:text-gray-50">
      <h3 className="font-display text-lg md:text-xl lg:text-2xl mb-4 font-medium">Projects</h3>
      <div className="flex flex-col gap-6">
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
