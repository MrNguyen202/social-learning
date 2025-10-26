"use client";

export default function ExerciseSpeaking({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const { sentence, ipa, sentence_vi } = exercise.data;

  const handleCheck = () => {
    // Dạng bài này ta tạm tin tưởng người dùng
    // và chỉ check khi họ bấm "Hoàn thành"
    onCheck(true, sentence);
  };

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold">{exercise.question}</h2>
      <p className="text-3xl font-bold text-blue-600">{sentence}</p>
      <p className="text-gray-500 italic">{ipa}</p>
      <p className="text-gray-400">"{sentence_vi}"</p>

      <div className="pt-6">
        <button
          onClick={() => alert("Bắt đầu ghi âm... (chức năng giả)")}
          className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-600"
        >
          Bắt đầu nói 🎤
        </button>
      </div>

      <div className="mt-10">
        <button
          onClick={handleCheck}
          disabled={isChecking}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold text-lg disabled:bg-gray-300"
        >
          Hoàn thành
        </button>
      </div>
    </div>
  );
}
