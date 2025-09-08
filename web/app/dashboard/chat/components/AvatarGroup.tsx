"use client";

import { getUserImageSrc } from "@/app/api/image/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface Member {
    id: string;
    avatarUrl: string;
    name: string;
}

export default function AvatarGroup({ members }: { members: Member[] }) {
    if (members.length === 3) {
        return (
            <div className="relative w-14 h-14 rounded-lg overflow-hidden">
                {/* Avatar trên */}
                <Avatar className="absolute top-0 left-1/4 w-7 h-7 rounded-full object-cover">
                    <AvatarImage
                        src={getUserImageSrc(members[0]?.avatarUrl)}
                        alt={members[0]?.name}
                        width={28}
                        height={28}
                    />
                    <AvatarFallback className="bg-gray-300 w-7 h-7">{members[0]?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* Avatar dưới trái */}
                <Avatar className="absolute bottom-0 left-0 w-7 h-7 rounded-full object-cover">
                    <AvatarImage
                        src={getUserImageSrc(members[1]?.avatarUrl)}
                        alt={members[1]?.name}
                        width={28}
                        height={28}
                    />
                    <AvatarFallback className="bg-gray-300 w-7 h-7">{members[1]?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* Avatar dưới phải */}
                <Avatar className="absolute bottom-0 right-0 w-7 h-7 rounded-full object-cover">
                    <AvatarImage
                        src={getUserImageSrc(members[2]?.avatarUrl)}
                        alt={members[2]?.name}
                        width={28}
                        height={28}
                    />
                    <AvatarFallback className="bg-gray-300 w-7 h-7">{members[2]?.name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        );
    }

    return (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden">
            {/* Top Left */}
            <Avatar className="absolute top-0 left-0 w-7 h-7 rounded-full object-cover">
                <AvatarImage
                    src={getUserImageSrc(members[0]?.avatarUrl)}
                    alt={members[0]?.name}
                    width={28}
                    height={28}
                />
                <AvatarFallback className="bg-gray-300 w-7 h-7">{members[0]?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {/* Top Right */}
            <Avatar className="absolute top-0 right-0 w-7 h-7 rounded-full object-cover">
                <AvatarImage
                    src={getUserImageSrc(members[1]?.avatarUrl)}
                    alt={members[1]?.name}
                    width={28}
                    height={28}
                />
                <AvatarFallback className="bg-gray-300 w-7 h-7">{members[1]?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {/* Bottom Left */}
            <Avatar className="absolute bottom-0 left-0 w-7 h-7 rounded-full object-cover">
                <AvatarImage
                    src={getUserImageSrc(members[2]?.avatarUrl)}
                    alt={members[2]?.name}
                    width={28}
                    height={28}
                />
                <AvatarFallback className="bg-gray-300 w-7 h-7">{members[2]?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {/* Bottom Right hoặc số thêm */}
            {members.length > 4 ? (
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-gray-400 flex items-center justify-center rounded-full">
                    <span className="text-white text-xs font-bold">
                        +{members.length - 3}
                    </span>
                </div>
            ) : (
                <Avatar className="absolute bottom-0 right-0 w-7 h-7 rounded-full object-cover">
                    <AvatarImage
                        src={getUserImageSrc(members[3]?.avatarUrl)}
                        alt={members[3]?.name}
                        width={28}
                        height={28}
                    />
                    <AvatarFallback className="bg-gray-300 w-7 h-7">{members[3]?.name.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
