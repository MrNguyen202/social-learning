import ExerciseMultipleChoice from "./ExerciseMultipleChoice";
import ExerciseSentenceOrder from "./ExerciseSentenceOrder";
import ExerciseSynonymMatch from "./ExerciseSynonymMatch";
import ExerciseSpeaking from "./ExerciseSpeaking";
import ExerciseWordBuild from "./ExerciseWordBuild";
import ExerciseFillInBlank from "./ExerciseFillInBlank";

export default function ExerciseItem({ t, exercise, onCheck, isChecking }: any) {
  const props = { t, exercise, onCheck, isChecking };

  switch (exercise.type) {
    case "multiple_choice":
      return <ExerciseMultipleChoice {...props} />;
    case "sentence_order":
      return <ExerciseSentenceOrder {...props} />;
    case "synonym_match":
      return <ExerciseSynonymMatch {...props} />;
    case "speaking":
      return <ExerciseSpeaking {...props} />;
    case "word_build":
      return <ExerciseWordBuild {...props} />;
    case "fill_in_blank":
      return <ExerciseFillInBlank {...props} />;
    default:
      return <p>{t("learning.unsupportedExercise")}</p>;
  }
}
