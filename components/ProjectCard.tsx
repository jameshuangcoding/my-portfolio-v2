import Link from "next/link";
import { Project } from "../utils/projects";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const ProjectCard = ({project}: {project: Project}) => {
    return (
        <Link 
            href={project.link}
            className="block p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white cursor-pointer border border-gray-200 relative group"
        >
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-800 pr-8">{project.title}</h3>
                <p className="text-xs text-gray-600">{project.description}</p>
            </div>
            <FaArrowUpRightFromSquare 
                className="w-3 h-3 absolute top-6 right-6 text-gray-400 transition-transform duration-300 group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
        </Link>
    )
}   

export default ProjectCard;