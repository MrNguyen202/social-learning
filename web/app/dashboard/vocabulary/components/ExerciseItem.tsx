// import ExerciseMultipleChoice from "./ExerciseMultipleChoice";
// import ExerciseSentenceOrder from "./ExerciseSentenceOrder";
// import ExerciseSynonymMatch from "./ExerciseSynonymMatch";
// import ExerciseSpeaking from "./ExerciseSpeaking";
// import ExerciseWordBuild from "./ExerciseWordBuild";

// export default function ExerciseItem({ exercise, onNext }: any) {
//   switch (exercise.type) {
//     case "multiple_choice":
//       return <ExerciseMultipleChoice exercise={exercise} onNext={onNext} />;
//     case "sentence_order":
//       return <ExerciseSentenceOrder exercise={exercise} onNext={onNext} />;
//     case "synonym_match":
//       return <ExerciseSynonymMatch exercise={exercise} onNext={onNext} />;
//     case "speaking":
//       return <ExerciseSpeaking exercise={exercise} onNext={onNext} />;
//     case "word_build":
//       return <ExerciseWordBuild exercise={exercise} onNext={onNext} />;
//     default:
//       return <p>Không hỗ trợ loại bài tập này.</p>;
//   }
// }

// ExerciseItem.tsx
import ExerciseMultipleChoice from "./ExerciseMultipleChoice";
import ExerciseSentenceOrder from "./ExerciseSentenceOrder";
import ExerciseSynonymMatch from "./ExerciseSynonymMatch";
import ExerciseSpeaking from "./ExerciseSpeaking";
import ExerciseWordBuild from "./ExerciseWordBuild";
// ✨ Import component mới
import ExerciseFillInBlank from "./ExerciseFillInBlank";

export default function ExerciseItem({ exercise, onCheck, isChecking }: any) {
  // ✨ Truyền props mới xuống tất cả component con
  const props = { exercise, onCheck, isChecking };

  switch (exercise.type) {
    case "multiple_choice":
      return <ExerciseMultipleChoice {...props} />;
    case "sentence_order":
      return <ExerciseSentenceOrder {...props} />;
    case "synonym_match":
      return <ExerciseSynonymMatch {...props} />;
    case "speaking":
      // ✨ Speaking dùng onCheck thay vì onNext
      return <ExerciseSpeaking {...props} />;
    case "word_build":
      return <ExerciseWordBuild {...props} />;
    // ✨ Thêm case mới
    case "fill_in_blank":
      return <ExerciseFillInBlank {...props} />;
    default:
      return <p>Không hỗ trợ loại bài tập này.</p>;
  }
}
