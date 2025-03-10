import Link from "next/link";
import { Project } from "../data/projects";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const ProjectCard = ({project}: {project: Project}) => {
    return (
        <Link 
            href={project.link}
            className="block p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 
            bg-light-primary dark:bg-dark-secondary cursor-pointer 
            border border-gray-200 dark:border-gray-700 relative group"
        >
            <div className="space-y-2">
                <h3 className="text-xs md:text-sm lg:text-md xl:text-lg font-bold font-display text-gray-900 dark:text-gray-50 pr-8 ">
                    {project.title}
                </h3>
                <p className="text-xs md:text-sm lg:text-md xl:text-lg text-gray-700 dark:text-gray-300 font-sans">
                    {project.description}
                </p>
            </div>
            <FaArrowUpRightFromSquare 
                className="w-3 h-3 absolute top-6 right-6 text-gray-400 dark:text-gray-500 
                transition-transform duration-300 group-hover:transform 
                group-hover:translate-x-1 group-hover:-translate-y-1"
            />
        </Link>
    )
}   

export default ProjectCard;