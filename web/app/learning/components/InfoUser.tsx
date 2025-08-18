export function InfoUser() {
    return (
        <div className="w-full p-6 grid col-span-1 border rounded-xl border-orange-300 bg-gradient-to-r from-orange-100 to-pink-100 h-fit">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
                <img src="/default-avatar-profile-icon.jpg" alt="Avatar" className="inline-block h-16 w-16 rounded-full border-2 border-orange-500" />
                <div>
                    <h2 className="text-lg font-semibold">Nguyễn Văn A</h2>
                    <h3 className="text-sm">Biệt danh</h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-semibold">150</span>
                    <span className="text-sm">Bài viết</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-semibold">200</span>
                    <span className="text-sm">Bạn bè</span>
                </div>
            </div>
        </div>
    )
}
