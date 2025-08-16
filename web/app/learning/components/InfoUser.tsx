export function InfoUser() {
    return (
        <div className="w-full p-6 grid col-span-1 border rounded-xl border-orange-300 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
                <img src="/default-avatar-profile-icon.jpg" alt="Avatar" className="inline-block h-16 w-16 rounded-full border-2 border-white" />
                <div>
                    <h2 className="text-lg font-semibold">Nguyễn Văn A</h2>
                    <h3 className="text-sm">Biệt danh</h3>
                </div>
            </div>
        </div>
    )
}
