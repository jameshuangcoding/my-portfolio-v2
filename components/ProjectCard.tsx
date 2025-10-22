import Link from "next/link";
import Image from "next/image";
import { Project } from "../data/projects";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const ProjectCard = ({project}: {project: Project}) => {
    return (
        <Link
            href={project.link}
            className="flex flex-col md:flex-row gap-4 p-4 rounded-lg
            bg-light-primary dark:bg-dark-secondary
            border border-gray-200 dark:border-gray-700
            hover:border-light-tertiary dark:hover:border-dark-tertiary
            hover:shadow-lg transition-all duration-300 group overflow-hidden"
        >
            {/* Image Container - 40% width on desktop */}
            <div className="w-full md:w-2/5 flex-shrink-0">
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            </div>

            {/* Content Container - 60% width on desktop */}
            <div className="flex-1 flex flex-col justify-center space-y-2 relative">
                <h3 className="text-base md:text-lg lg:text-xl font-bold font-display text-gray-900 dark:text-gray-50 pr-8 group-hover:text-light-tertiary dark:group-hover:text-dark-tertiary transition-colors">
                    {project.title}
                </h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-sans">
                    {project.description}
                </p>
                <FaArrowUpRightFromSquare
                    className="w-4 h-4 absolute top-0 right-0 text-gray-400 dark:text-gray-500
                    group-hover:text-light-tertiary dark:group-hover:text-dark-tertiary
                    transition-all duration-300
                    group-hover:translate-x-1 group-hover:-translate-y-1"
                />
            </div>
        </Link>
    )
}

export default ProjectCard;