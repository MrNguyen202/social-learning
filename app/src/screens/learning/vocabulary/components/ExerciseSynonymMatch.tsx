// import React, { useState, useEffect, useMemo } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// const shuffle = (array: any[]) => {
//   let currentIndex = array.length,
//     randomIndex;
//   while (currentIndex !== 0) {
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex],
//       array[currentIndex],
//     ];
//   }
//   return array;
// };

// type Pair = { a: string; b: string };
// type Selected = { side: 'a' | 'b'; value: string } | null;

// export default function ExerciseSynonymMatch({
//   exercise,
//   onCheck,
//   isChecking,
// }: any) {
//   const { pairs }: { pairs: Pair[] } = exercise.data;

//   const colA = useMemo(() => shuffle([...pairs.map(p => p.a)]), [pairs]);
//   const colB = useMemo(() => shuffle([...pairs.map(p => p.b)]), [pairs]);

//   const [selected, setSelected] = useState<Selected>(null);
//   const [matched, setMatched] = useState<string[]>([]);

//   useEffect(() => {
//     setSelected(null);
//     setMatched([]);
//   }, [exercise.id]);

//   const handleSelect = (side: 'a' | 'b', value: string) => {
//     if (isChecking || matched.includes(value)) return;

//     if (!selected) {
//       setSelected({ side, value });
//       return;
//     }

//     if (selected.side === side) {
//       setSelected({ side, value });
//       return;
//     }

//     const pairA = side === 'a' ? value : selected.value;
//     const pairB = side === 'b' ? value : selected.value;
//     const isMatch = pairs.some(p => p.a === pairA && p.b === pairB);

//     if (isMatch) {
//       setMatched([...matched, pairA, pairB]);
//       setSelected(null);
//     } else {
//       setSelected(null);
//     }
//   };

//   const isCompleted = matched.length === pairs.length * 2;

//   const getButtonStyles = (side: 'a' | 'b', value: string) => {
//     if (matched.includes(value)) {
//       return styles.buttonMatched;
//     }
//     if (selected?.side === side && selected?.value === value) {
//       return styles.buttonSelected;
//     }
//     return styles.buttonIdle;
//   };

//   const handleCheck = () => {
//     onCheck(true, 'Hoàn thành ghép cặp');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.question}>{exercise.question}</Text>

//       <View style={styles.matchContainer}>
//         {/* Cột A */}
//         <View style={styles.column}>
//           {colA.map((value: string, i: number) => (
//             <TouchableOpacity
//               key={i}
//               onPress={() => handleSelect('a', value)}
//               disabled={isChecking || matched.includes(value)}
//               style={[styles.matchButton, getButtonStyles('a', value)]}
//             >
//               <Text style={styles.matchText}>{value}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         {/* Cột B */}
//         <View style={styles.column}>
//           {colB.map((value: string, i: number) => (
//             <TouchableOpacity
//               key={i}
//               onPress={() => handleSelect('b', value)}
//               disabled={isChecking || matched.includes(value)}
//               style={[styles.matchButton, getButtonStyles('b', value)]}
//             >
//               <Text style={styles.matchText}>{value}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       <View style={styles.buttonContainer}>
//         <TouchableOpacity
//           onPress={handleCheck}
//           disabled={!isCompleted || isChecking}
//           style={[
//             styles.checkButton,
//             (!isCompleted || isChecking) && styles.buttonDisabled,
//           ]}
//         >
//           <Text style={styles.checkButtonText}>Kiểm tra</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     gap: 12,
//   },
//   question: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 24,
//   },
//   matchContainer: {
//     flexDirection: 'row',
//     gap: 16,
//     marginTop: 16,
//   },
//   column: {
//     flex: 1,
//     gap: 8,
//   },
//   matchButton: {
//     width: '100%',
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderRadius: 8,
//     borderWidth: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   matchText: {
//     fontSize: 16,
//   },
//   buttonIdle: {
//     borderColor: '#D1D5DB',
//     backgroundColor: 'white',
//   },
//   buttonSelected: {
//     borderColor: '#60A5FA',
//     backgroundColor: '#DBEAFE',
//   },
//   buttonMatched: {
//     borderColor: '#4ADE80',
//     backgroundColor: '#F0FDF4',
//     opacity: 0.5,
//   },
//   buttonContainer: {
//     marginTop: 40,
//   },
//   checkButton: {
//     width: '100%',
//     backgroundColor: '#22C55E',
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   checkButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 18,
//     textAlign: 'center',
//   },
//   buttonDisabled: {
//     backgroundColor: '#D1D5DB',
//   },
// });

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

const shuffle = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

type Pair = { a: string; b: string };
type Selected = { side: 'a' | 'b'; value: string } | null;

export default function ExerciseSynonymMatch({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const { pairs }: { pairs: Pair[] } = exercise.data;

  const colA = useMemo(() => shuffle([...pairs.map(p => p.a)]), [pairs]);
  const colB = useMemo(() => shuffle([...pairs.map(p => p.b)]), [pairs]);

  const [selected, setSelected] = useState<Selected>(null);
  const [matched, setMatched] = useState<string[]>([]);

  // Animation value cho hiệu ứng rung
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Reset khi đổi câu hỏi
  useEffect(() => {
    setSelected(null);
    setMatched([]);
    shakeAnimation.setValue(0);
  }, [exercise.id]);

  // Tự động submit KHI ĐÚNG HẾT
  useEffect(() => {
    const isCompleted = matched.length === pairs.length * 2;
    // Nếu hoàn thành và chưa bị checking (chưa sai)
    if (isCompleted && !isChecking) {
      onCheck(true, 'Hoàn thành ghép cặp');
    }
  }, [matched, pairs.length, isChecking]);

  const triggerShake = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelect = (side: 'a' | 'b', value: string) => {
    // Nếu đang checking (đang chờ chuyển câu) hoặc đã match rồi thì chặn
    if (isChecking || matched.includes(value)) return;

    if (!selected) {
      setSelected({ side, value });
      return;
    }

    if (selected.side === side) {
      setSelected({ side, value });
      return;
    }

    // Kiểm tra match
    const pairA = side === 'a' ? value : selected.value;
    const pairB = side === 'b' ? value : selected.value;
    const correctPairObj = pairs.find(p => p.a === pairA || p.b === pairB); // Tìm cặp đúng để báo lỗi nếu sai
    const isMatch = pairs.some(p => p.a === pairA && p.b === pairB);

    if (isMatch) {
      // ĐÚNG: Thêm vào list matched
      setMatched([...matched, pairA, pairB]);
      setSelected(null);
    } else {
      // SAI:
      setSelected(null);
      triggerShake(); // Rung màn hình

      // Tạo thông báo đáp án đúng
      // Logic: User chọn sai, cần báo cho user biết từ vừa chọn đi với từ nào
      let correctAnswerText = 'Ghép cặp sai';
      if (correctPairObj) {
        correctAnswerText = `"${correctPairObj.a}" phải đi với "${correctPairObj.b}"`;
      }

      // Gọi onCheck False ngay lập tức để parent xử lý (trừ mạng, chuyển câu)
      onCheck(false, correctAnswerText);
    }
  };

  const getButtonStyles = (side: 'a' | 'b', value: string) => {
    if (matched.includes(value)) {
      return styles.buttonMatched;
    }
    if (selected?.side === side && selected?.value === value) {
      return styles.buttonSelected;
    }
    return styles.buttonIdle;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>

      <Animated.View
        style={[
          styles.matchContainer,
          { transform: [{ translateX: shakeAnimation }] },
        ]}
      >
        {/* Cột A */}
        <View style={styles.column}>
          {colA.map((value: string, i: number) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelect('a', value)}
              disabled={isChecking || matched.includes(value)}
              style={[styles.matchButton, getButtonStyles('a', value)]}
            >
              <Text style={styles.matchText}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Cột B */}
        <View style={styles.column}>
          {colB.map((value: string, i: number) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelect('b', value)}
              disabled={isChecking || matched.includes(value)}
              style={[styles.matchButton, getButtonStyles('b', value)]}
            >
              <Text style={styles.matchText}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Đã xóa nút Kiểm tra thủ công */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1F2937',
  },
  matchContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  matchButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  buttonIdle: {
    borderColor: '#E5E7EB', // Gray-200
    backgroundColor: 'white',
  },
  buttonSelected: {
    borderColor: '#60A5FA', // Blue-400
    backgroundColor: '#EFF6FF', // Blue-50
  },
  buttonMatched: {
    borderColor: '#4ADE80', // Green-400
    backgroundColor: '#F0FDF4', // Green-50
    opacity: 0.6,
  },
});
