// import { cn } from "@/lib/utils"
import { cn } from "@/utils/cn"
import { Leaf } from "lucide-react"

export function TitleDivider({ title, className, color, size, fontWeight = "semibold" }) {
    return (
        <div className={cn("w-60 lg:w-96 mx-auto flex flex-col items-center my-4", className)}>

            <div className="w-full flex items-center justify-center my-2">
                <div className={cn(`h-[1px] flex-grow bg-${color}`)}></div>
                <div className={cn(`mx-4 text-${color}`)}>
                    <Leaf className="h-5 w-5" />
                </div>
                <div className={cn(`h-[1px] flex-grow bg-${color}`)}></div>
            </div>
            <h2 style={{color:`${color}`}} className={cn(`text-xl font-${fontWeight} text-${size} mb-2`)}>{title}</h2>

        </div>
    )
}
