export interface LoadedTopic {
  id: string;
  content_en: string;
  content_vi: string;
  description_en: string;
  description_vi: string;
  participant_a: string;
  participant_b: string;
  task_a_en: string;
  task_b_en: string;
  sub_topic_en: string;
  sub_topic_vi: string;
  task_a_vi: string;
  task_b_vi: string;
}

export interface Feedback {
  review: string;
  correction: string;
}

export interface VoiceSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
}
