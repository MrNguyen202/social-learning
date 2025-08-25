import * as Icons from "lucide-react"

export function Icon({ name, color, className }: { name: string; color?: string; className?: string }) {
    const IconComponent = Icons[name as keyof typeof Icons] as Icons.LucideIcon;
    return IconComponent ? <IconComponent className={className} color={color} /> : null;
}
