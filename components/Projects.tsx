import { projects } from "../data/projects";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  return (
    <div className="stagger text-gray-900 dark:text-gray-50">
      <h1 className="font-display text-[length:var(--step-3)] mb-6 font-medium tracking-tight">Projects</h1>
      {projects.map((project, i) => (
        <ProjectCard key={i} project={project} />
      ))}
    </div>
  );
};

export default Projects;
