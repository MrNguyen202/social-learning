import React, { useEffect, useState } from "react";
import { View, Text, Button, PermissionsAndroid, Platform } from "react-native";
import Voice from "@react-native-voice/voice";

async function requestMicPermission() {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Permission to use microphone',
      message: 'App needs access to your microphone to recognize speech.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}


export default function LessonSpeaking() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    console.log("Voice module loaded:", Voice);

    Voice.onSpeechStart = () => console.log("Speech started");
    Voice.onSpeechEnd = () => {
      console.log("Speech ended");
      setIsListening(false);
    };
    Voice.onSpeechResults = (event) => {
      console.log("Speech results:", event.value);
      setText(event.value?.[0] || "");
    };
    Voice.onSpeechError = (error) => console.log("Speech error:", error);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startListening = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.warn("Permission denied");
      return;
    }

    try {
      await Voice.start("en-US");
      setIsListening(true);
    } catch (e) {
      console.error("Error starting voice:", e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error("Error stopping voice:", e);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-xl font-bold mb-4">Voice Recognition Test</Text>
      <Text className="text-base mb-6 text-gray-700">{text || "..."}</Text>
      <Button
        title={isListening ? "Stop" : "Start"}
        onPress={isListening ? stopListening : startListening}
      />
    </View>
  );
}