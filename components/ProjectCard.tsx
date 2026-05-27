import Link from "next/link";
import { Project } from "../data/projects";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const ProjectCard = ({ project }: { project: Project }) => {
  const hasLink = project.link.trim() !== "";

  const inner = (
    <div className="flex flex-row justify-between items-baseline gap-4 border-t border-gray-200 dark:border-gray-700 py-3">
      <div className="min-w-0">
        <h3 className="text-[length:var(--step-1)] font-display font-medium text-gray-900 dark:text-gray-50 group-hover:text-light-tertiary dark:group-hover:text-dark-tertiary transition-colors">
          {project.title}
        </h3>
        <p className="text-[length:var(--step--1)] text-gray-500 dark:text-gray-400 font-sans mt-0.5">
          {project.description}
        </p>
      </div>
      {hasLink && (
        <FaArrowUpRightFromSquare
          className="w-3.5 h-3.5 mt-1.5 shrink-0 text-gray-400 dark:text-gray-500
          group-hover:text-light-tertiary dark:group-hover:text-dark-tertiary
          transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </div>
  );

  if (!hasLink) {
    return <div className="group">{inner}</div>;
  }

  return (
    <Link href={project.link} className="group block">
      {inner}
    </Link>
  );
};

export default ProjectCard;
