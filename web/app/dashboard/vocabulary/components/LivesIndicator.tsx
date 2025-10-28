"use client";

interface Props {
  lives: number;
}

export default function LivesIndicator({ lives }: Props) {
  const hearts = Array.from({ length: 3 }, (_, i) => i < lives);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl font-bold text-blue-400">❄️</span>
      <span className={`text-lg font-bold ${lives === 0 ? 'text-red-500' : 'text-gray-700'}`}>
        {lives}
      </span>
    </div>
  );
}