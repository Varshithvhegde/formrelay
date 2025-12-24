import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
    const sizes = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl",
    };

    const iconSizes = {
        sm: "h-5 w-5",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    return (
        <div className={cn("flex items-center gap-2 font-bold", sizes[size], className)}>
            <div className={cn("rounded-lg bg-primary/10 p-1", iconSizes[size] === "h-8 w-8" ? "p-2" : "p-1")}>
                <Zap className={cn("text-primary fill-primary/20", iconSizes[size])} />
            </div>
            <span className="tracking-tight">
                Form<span className="text-primary">Relay</span>
            </span>
        </div>
    );
}
