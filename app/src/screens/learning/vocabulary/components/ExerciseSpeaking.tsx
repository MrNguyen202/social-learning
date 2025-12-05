// import React, { useEffect, useState, useMemo, useRef } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import Voice, {
//   SpeechErrorEvent,
//   SpeechResultsEvent,
// } from '@react-native-voice/voice';
// import { Mic, Volume2 } from 'lucide-react-native';
// import Toast from 'react-native-toast-message';
// import Tts from 'react-native-tts';
// import ClickToSpeak from './ClickToSpeak';

// const normalize = (s: string) =>
//   s
//     .toLowerCase()
//     .replace(/[.,!?;:\\"'()[\]{}]/g, '')
//     .replace(/\s+/g, ' ')
//     .trim();

// export default function ExerciseSpeaking({
//   exercise,
//   onCheck,
//   isChecking,
// }: any) {
//   const { sentence, ipa, sentence_vi } = exercise.data;

//   const [transcript, setTranscript] = useState('');
//   const [listening, setListening] = useState(false);
//   const [result, setResult] = useState<React.ReactNode | null>(null);
//   const [attemptCount, setAttemptCount] = useState(0);
//   const [error, setError] = useState('');
//   const MAX_WRONG_ATTEMPTS = 3;

//   const hasCheckedRef = useRef(false);
//   const wasListeningRef = useRef(false);

//   useEffect(() => {
//     Tts.getInitStatus().then(() => Tts.setDefaultLanguage('en-US'));

//     Voice.removeAllListeners();

//     const onSpeechStart = () => {
//       setError('');
//       setListening(true);
//       wasListeningRef.current = true;
//     };
//     let speechEndTimeout: any;
//     Voice.onSpeechEnd = () => {
//       if (speechEndTimeout) clearTimeout(speechEndTimeout);

//       speechEndTimeout = setTimeout(() => {
//         setListening(false);
//       }, 700); // delay 700ms để cho user nói tiếp
//     };
//     Voice.onSpeechResults = event => {
//       if (event.value && event.value.length > 0) {
//         setTranscript(event.value?.[0] || '');
//       }
//     };
//     Voice.onSpeechPartialResults = event => {
//       if (event.value && event.value.length > 0) {
//         setTranscript(event.value?.[0] || '');
//       }
//     };
//     Voice.onSpeechError = e => {
//       if (e.error?.code === '11') {
//         setError('Không nghe rõ. Hãy thử nói lại.');
//         setTranscript('');
//         return;
//       }

//       setListening(false);
//     };

//     Voice.onSpeechStart = onSpeechStart;

//     return () => {
//       Voice.destroy().then(Voice.removeAllListeners);
//     };
//   }, []);

//   useEffect(() => {
//     resetTranscript();
//     setResult(null);
//     setAttemptCount(0);
//     hasCheckedRef.current = false;
//     wasListeningRef.current = false;
//   }, [exercise.id]);

//   const resetTranscript = () => {
//     setTranscript('');
//   };

//   const speak = () => {
//     Tts.stop();
//     Tts.speak(sentence);
//   };

//   const checkPronunciation = (spokenText: string) => {
//     const sample = normalize(sentence);
//     const spoken = normalize(spokenText);
//     const sampleWords = sample.split(' ');
//     const spokenWords = spoken.split(' ');

//     let isCorrect = true;
//     if (sampleWords.length !== spokenWords.length) isCorrect = false;

//     const compared = sampleWords.map((word, i) => {
//       if (spokenWords[i] === word) {
//         return (
//           <Text key={i} style={styles.textCorrect}>
//             {word}{' '}
//           </Text>
//         );
//       } else {
//         isCorrect = false;
//         return (
//           <Text key={i} style={styles.textIncorrect}>
//             {spokenWords[i] || '___'}{' '}
//           </Text>
//         );
//       }
//     });

//     if (spokenWords.length > sampleWords.length) {
//       isCorrect = false;
//       for (let i = sampleWords.length; i < spokenWords.length; i++) {
//         compared.push(
//           <Text key={i} style={styles.textExtra}>
//             {spokenWords[i]}{' '}
//           </Text>,
//         );
//       }
//     }
//     setResult(<View style={styles.resultContainer}>{compared}</View>);
//     return isCorrect;
//   };

//   const handleCheck = (spokenText: string) => {
//     if (hasCheckedRef.current || isChecking) return;
//     hasCheckedRef.current = true;

//     const isCorrect = checkPronunciation(spokenText);

//     if (isCorrect) {
//       Toast.show({ type: 'success', text1: 'Chính xác!' });
//       setAttemptCount(0);
//       onCheck(true, sentence);
//     } else {
//       const newAttemptCount = attemptCount + 1;
//       setAttemptCount(newAttemptCount);
//       if (newAttemptCount >= MAX_WRONG_ATTEMPTS) {
//         Toast.show({
//           type: 'error',
//           text1: `Bạn đã sai quá ${MAX_WRONG_ATTEMPTS} lần.`,
//         });
//         setAttemptCount(0);
//         onCheck(false, sentence);
//       } else {
//         const attemptsLeft = MAX_WRONG_ATTEMPTS - newAttemptCount;
//         Toast.show({
//           type: 'info',
//           text1: `Sai rồi! Bạn còn ${attemptsLeft} lần thử.`,
//         });
//       }
//     }
//   };

//   const startListening = async () => {
//     if (listening || isChecking) return;

//     resetTranscript();
//     setResult(null);
//     hasCheckedRef.current = false;

//     try {
//       await Voice.start('en-US');
//     } catch (e) {
//       console.error('startListening error: ', e);
//     }
//   };

//   useEffect(() => {
//     if (
//       !listening &&
//       wasListeningRef.current &&
//       !isChecking &&
//       !hasCheckedRef.current
//     ) {
//       wasListeningRef.current = false;
//       handleCheck(transcript);
//     }
//   }, [listening, isChecking, transcript]);

//   const clickableSentence = useMemo(() => {
//     return sentence.split(/(\s+)/g).map((part: string, index: number) => {
//       if (part.trim() === '')
//         return (
//           <Text key={index} style={styles.sentenceText}>
//             {part}
//           </Text>
//         );
//       return <ClickToSpeak key={index} word={part} />;
//     });
//   }, [sentence]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.question}>{exercise.question}</Text>

//       <View style={styles.sentenceBox}>
//         <TouchableOpacity onPress={speak} style={styles.speakButton}>
//           <Volume2 size={28} color="#2563EB" />
//         </TouchableOpacity>
//         <Text style={styles.sentenceText}>{clickableSentence}</Text>
//       </View>
//       <Text style={styles.ipa}>{ipa}</Text>
//       <Text style={styles.translation}>"{sentence_vi}"</Text>

//       <View style={styles.micButtonContainer}>
//         <TouchableOpacity
//           onPress={startListening}
//           disabled={listening || isChecking}
//           style={[
//             styles.micButton,
//             listening ? styles.micButtonListening : styles.micButtonIdle,
//           ]}
//         >
//           <Mic size={24} color="white" />
//           <Text style={styles.micButtonText}>
//             {listening ? 'Đang nghe' : 'Bắt đầu nói'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.transcriptBox}>
//         <Text style={styles.transcriptTitle}>Bạn đã nói:</Text>
//         {result ? (
//           result
//         ) : (
//           <Text style={styles.transcriptText}>{transcript || '...'}</Text>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     gap: 12,
//   },
//   question: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   sentenceBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: '#F9FAFB',
//     padding: 16,
//     borderRadius: 8,
//   },
//   speakButton: {
//     padding: 8,
//   },
//   sentenceText: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#2563EB',
//     flexShrink: 1,
//   },
//   ipa: {
//     color: '#6B7280',
//     fontStyle: 'italic',
//   },
//   translation: {
//     color: '#9CA3AF',
//   },
//   micButtonContainer: {
//     paddingTop: 24,
//   },
//   micButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 99,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   micButtonIdle: {
//     backgroundColor: '#3B82F6',
//   },
//   micButtonListening: {
//     backgroundColor: '#9CA3AF',
//   },
//   micButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   transcriptBox: {
//     minHeight: 100,
//     width: '100%',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 8,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   transcriptTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#6B7280',
//     marginBottom: 8,
//   },
//   transcriptText: {
//     color: '#374151',
//     fontStyle: 'italic',
//   },
//   resultContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   textCorrect: {
//     color: '#16A34A',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   textIncorrect: {
//     color: '#EF4444',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   textExtra: {
//     color: '#EF4444',
//     textDecorationLine: 'line-through',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ActivityIndicator, // Thêm để hiển thị loading
} from 'react-native';
// --- THAY ĐỔI IMPORT ---
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import { Mic, Volume2, Square } from 'lucide-react-native'; // Thêm icon Square
import Toast from 'react-native-toast-message';
import Tts from 'react-native-tts';
import ClickToSpeak from './ClickToSpeak';
// Import hàm API bạn đã tạo ở bước trước
import { speechToText } from '../../../../api/learning/speaking/route'; // Đảm bảo đường dẫn đúng

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?;:\\"'()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export default function ExerciseSpeaking({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const { sentence, ipa, sentence_vi } = exercise.data;

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false); // Đổi tên cho rõ nghĩa
  const [isProcessing, setIsProcessing] = useState(false); // State loading
  const [result, setResult] = useState<React.ReactNode | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const MAX_WRONG_ATTEMPTS = 3;
  const hasCheckedRef = useRef(false);

  // Cấu hình ghi âm (cho Mobile)
  const audioConfig = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    audioSource: 6,
    wavFile: 'exercise_test.wav', // Tên file khác chút để tránh trùng
  };

  useEffect(() => {
    Tts.getInitStatus().then(() => Tts.setDefaultLanguage('en-US'));

    // --- SETUP AUDIO RECORDER ---
    const setupRecorder = async () => {
      await requestPermission();
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        try {
          AudioRecord.init(audioConfig);
        } catch (e) {
          console.log('Recorder init error (ignore if re-init):', e);
        }
      }
    };
    setupRecorder();

    // Cleanup khi thoát component
    return () => {
      try {
        AudioRecord.stop();
      } catch (e) {}
    };
  }, []);

  // Reset khi đổi câu hỏi
  useEffect(() => {
    setTranscript('');
    setResult(null);
    setAttemptCount(0);
    hasCheckedRef.current = false;
    setIsListening(false);
    setIsProcessing(false);
  }, [exercise.id]);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const speak = () => {
    Tts.stop();
    Tts.speak(sentence);
  };

  // Logic chấm điểm (Giữ nguyên)
  const checkPronunciation = (spokenText: string) => {
    const sample = normalize(sentence);
    const spoken = normalize(spokenText);
    const sampleWords = sample.split(' ');
    const spokenWords = spoken.split(' ');

    let isCorrect = true;
    // Cơ chế check đơn giản: nếu khác số lượng từ hoặc từ không khớp
    if (sampleWords.length !== spokenWords.length) isCorrect = false;

    const compared = sampleWords.map((word, i) => {
      if (spokenWords[i] === word) {
        return (
          <Text key={i} style={styles.textCorrect}>
            {word}{' '}
          </Text>
        );
      } else {
        isCorrect = false;
        return (
          <Text key={i} style={styles.textIncorrect}>
            {spokenWords[i] || '___'}{' '}
          </Text>
        );
      }
    });

    if (spokenWords.length > sampleWords.length) {
      isCorrect = false;
      for (let i = sampleWords.length; i < spokenWords.length; i++) {
        compared.push(
          <Text key={i} style={styles.textExtra}>
            {spokenWords[i]}{' '}
          </Text>,
        );
      }
    }
    setResult(<View style={styles.resultContainer}>{compared}</View>);
    return isCorrect;
  };

  // Logic xử lý kết quả (Giữ nguyên logic đếm số lần sai)
  const handleCheck = (spokenText: string) => {
    // Nếu đang xử lý hoặc đã check rồi thì bỏ qua
    // Lưu ý: isChecking prop từ cha truyền vào có thể chặn user spam
    if (hasCheckedRef.current || isChecking) return;
    hasCheckedRef.current = true;

    const isCorrect = checkPronunciation(spokenText);

    if (isCorrect) {
      Toast.show({ type: 'success', text1: 'Chính xác!' });
      setAttemptCount(0);
      onCheck(true, sentence);
    } else {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      if (newAttemptCount >= MAX_WRONG_ATTEMPTS) {
        Toast.show({
          type: 'error',
          text1: `Bạn đã sai quá ${MAX_WRONG_ATTEMPTS} lần.`,
        });
        setAttemptCount(0);
        onCheck(false, sentence);
      } else {
        const attemptsLeft = MAX_WRONG_ATTEMPTS - newAttemptCount;
        Toast.show({
          type: 'info',
          text1: `Sai rồi! Bạn còn ${attemptsLeft} lần thử.`,
        });
        // Reset ref để cho phép thử lại (nếu chưa quá số lần)
        hasCheckedRef.current = false;
      }
    }
  };

  // --- LOGIC RECORDING MỚI ---
  const startListening = async () => {
    if (isListening || isChecking || isProcessing) return;

    setTranscript('');
    setResult(null);
    hasCheckedRef.current = false;

    try {
      setIsListening(true);
      AudioRecord.start();
    } catch (e) {
      console.error('startListening error: ', e);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    if (!isListening) return;

    setIsListening(false);
    setIsProcessing(true); // Hiện loading

    try {
      const audioFile = await AudioRecord.stop();
      const base64String = await RNFS.readFile(audioFile, 'base64');

      // Gọi API Google Cloud
      const data = await speechToText(base64String);

      if (data && data.data && data.data.transcript) {
        const resultText = data.data.transcript;
        setTranscript(resultText);
        // Có kết quả -> Chấm điểm ngay lập tức
        handleCheck(resultText);
      } else {
        setTranscript('');
        Toast.show({ type: 'error', text1: 'Không nghe rõ, vui lòng thử lại' });
      }
    } catch (error) {
      console.error('API Error', error);
      Toast.show({ type: 'error', text1: 'Lỗi kết nối' });
    } finally {
      setIsProcessing(false);
    }
  };

  const clickableSentence = useMemo(() => {
    return sentence.split(/(\s+)/g).map((part: string, index: number) => {
      if (part.trim() === '')
        return (
          <Text key={index} style={styles.sentenceText}>
            {part}
          </Text>
        );
      return <ClickToSpeak key={index} word={part} />;
    });
  }, [sentence]);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>

      <View style={styles.sentenceBox}>
        <TouchableOpacity onPress={speak} style={styles.speakButton}>
          <Volume2 size={28} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.sentenceText}>{clickableSentence}</Text>
      </View>
      <Text style={styles.ipa}>{ipa}</Text>
      <Text style={styles.translation}>"{sentence_vi}"</Text>

      <View style={styles.micButtonContainer}>
        {/* Nút Mic thông minh: Chuyển đổi trạng thái Start -> Stop -> Loading */}
        <TouchableOpacity
          onPress={isListening ? stopListening : startListening}
          disabled={isChecking || isProcessing} // Disable khi đang check hoặc loading API
          style={[
            styles.micButton,
            isProcessing
              ? styles.micButtonProcessing
              : isListening
              ? styles.micButtonListening
              : styles.micButtonIdle,
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator
              color="white"
              size="small"
              style={{ marginRight: 8 }}
            />
          ) : isListening ? (
            <Square size={24} color="white" fill="white" />
          ) : (
            <Mic size={24} color="white" />
          )}

          <Text style={styles.micButtonText}>
            {isProcessing
              ? 'Đang xử lý...'
              : isListening
              ? 'Dừng nói'
              : 'Bắt đầu nói'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transcriptBox}>
        <Text style={styles.transcriptTitle}>Bạn đã nói:</Text>
        {result ? (
          result
        ) : (
          <Text style={styles.transcriptText}>
            {isListening
              ? 'Đang nghe...'
              : isProcessing
              ? 'Đang phân tích...'
              : transcript || '...'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
  },
  sentenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
  },
  speakButton: {
    padding: 8,
  },
  sentenceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    flexShrink: 1,
  },
  ipa: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  translation: {
    color: '#9CA3AF',
  },
  micButtonContainer: {
    paddingTop: 24,
  },
  micButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  micButtonIdle: {
    backgroundColor: '#3B82F6',
  },
  micButtonListening: {
    backgroundColor: '#EF4444', // Màu đỏ khi đang nghe
  },
  micButtonProcessing: {
    backgroundColor: '#9CA3AF', // Màu xám khi đang loading
  },
  micButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transcriptBox: {
    minHeight: 100,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transcriptTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
  },
  transcriptText: {
    color: '#374151',
    fontStyle: 'italic',
  },
  resultContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  textCorrect: {
    color: '#16A34A',
    fontWeight: '600',
    fontSize: 16,
  },
  textIncorrect: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  textExtra: {
    color: '#EF4444',
    textDecorationLine: 'line-through',
    fontWeight: '600',
    fontSize: 16,
  },
});
