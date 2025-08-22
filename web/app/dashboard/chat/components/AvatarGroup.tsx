"use client";

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
                <Image
                    src={members[0].avatarUrl}
                    alt={members[0].name}
                    width={28}
                    height={28}
                    className="absolute top-0 left-1/4 w-7 h-7 rounded-full object-cover"
                />
                {/* Avatar dưới trái */}
                <Image
                    src={members[1].avatarUrl}
                    alt={members[1].name}
                    width={28}
                    height={28}
                    className="absolute bottom-0 left-0 w-7 h-7 rounded-full object-cover"
                />
                {/* Avatar dưới phải */}
                <Image
                    src={members[2].avatarUrl}
                    alt={members[2].name}
                    width={28}
                    height={28}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full object-cover"
                />
            </div>
        );
    }

    return (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden">
            {/* Top Left */}
            <Image
                src={members[0].avatarUrl}
                alt={members[0].name}
                width={28}
                height={28}
                className="absolute top-0 left-0 w-7 h-7 rounded-full object-cover"
            />
            {/* Top Right */}
            <Image
                src={members[1].avatarUrl}
                alt={members[1].name}
                width={28}
                height={28}
                className="absolute top-0 right-0 w-7 h-7 rounded-full object-cover"
            />
            {/* Bottom Left */}
            <Image
                src={members[2].avatarUrl}
                alt={members[2].name}
                width={28}
                height={28}
                className="absolute bottom-0 left-0 w-7 h-7 rounded-full object-cover"
            />
            {/* Bottom Right hoặc số thêm */}
            {members.length > 4 ? (
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-gray-400 flex items-center justify-center rounded-full">
                    <span className="text-white text-xs font-bold">
                        +{members.length - 3}
                    </span>
                </div>
            ) : (
                <Image
                    src={members[3].avatarUrl}
                    alt={members[3].name}
                    width={28}
                    height={28}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full object-cover"
                />
            )}
        </div>
    );
}
