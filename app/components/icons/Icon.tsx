import * as Icons from "lucide-react-native"

export function Icon({ name, color, className, size }: { name: string; color?: string; className?: string; size?: number }) {
    const IconComponent = Icons[name as keyof typeof Icons] as Icons.LucideIcon;
    return IconComponent ? <IconComponent className={className} color={color} size={size} /> : null;
}