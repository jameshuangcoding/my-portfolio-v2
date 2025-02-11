import Link from "next/link";
import { Experience } from "../utils/experiences";
import Image from "next/image";

const ExperienceRow = ({exp}: {exp: Experience}) => {
    return (
        <Link href={exp.link}>
            <div className="flex flex-row justify-between items-center border-t border-dashed border-gray-200 py-1">
                <div className="flex flex-row items-center gap-2">
                    <Image src={exp.icon} alt={exp.company} width={25} height={25} />
                    <h3 className="text-xs">{exp.company}</h3>
                    <p className="text-xs text-gray-500">{exp.team}</p>
                </div>
                <div>
                    <p className="text-xs">{exp.time}</p>
                </div>
            </div>
        </Link>
    )
}  

export default ExperienceRow;