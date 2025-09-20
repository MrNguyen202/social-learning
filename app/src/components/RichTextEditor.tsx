import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextStyle,
} from 'react-native';
import {
  Bold,
  Italic,
  Underline,
  List,
  Quote,
  Type,
} from 'lucide-react-native';
import { theme } from '../../constants/theme';

const RichTextEditor = ({
  onChange,
}: {
  onChange?: (text: string) => void;
}) => {
  const [text, setText] = useState('');
  const [stylesState, setStylesState] = useState({
    bold: false,
    italic: false,
    underline: false,
    heading: false,
    quote: false,
    bullet: false,
  });

  const toggleStyle = (key: keyof typeof stylesState) => {
    setStylesState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getFontStyle = (): TextStyle => {
    return {
      fontWeight: stylesState.bold ? 'bold' : 'normal',
      fontStyle: stylesState.italic ? 'italic' : 'normal',
      textDecorationLine: stylesState.underline ? 'underline' : 'none',
      fontSize: stylesState.heading ? 20 : 16,
      color: stylesState.quote ? theme.colors.textLight : theme.colors.text,
    };
  };

  const renderPrefix = () => {
    if (stylesState.bullet) return '• ';
    if (stylesState.quote) return '❝ ';
    return '';
  };

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => toggleStyle('bold')}>
          <Bold
            size={20}
            color={stylesState.bold ? theme.colors.primary : 'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStyle('italic')}>
          <Italic
            size={20}
            color={stylesState.italic ? theme.colors.primary : 'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStyle('underline')}>
          <Underline
            size={20}
            color={stylesState.underline ? theme.colors.primary : 'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStyle('heading')}>
          <Type
            size={20}
            color={stylesState.heading ? theme.colors.primary : 'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStyle('bullet')}>
          <List
            size={20}
            color={stylesState.bullet ? theme.colors.primary : 'black'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStyle('quote')}>
          <Quote
            size={20}
            color={stylesState.quote ? theme.colors.primary : 'black'}
          />
        </TouchableOpacity>
      </View>

      {/* Input */}
      <TextInput
        style={[styles.input, getFontStyle()]}
        placeholder="Viết nội dung..."
        placeholderTextColor={theme.colors.textLight}
        multiline
        value={renderPrefix() + text}
        onChangeText={t => {
          // bỏ prefix khi gõ tiếp
          const cleanText = t.replace(/^• |^❝ /, '');
          setText(cleanText);
          onChange && onChange(cleanText);
        }}
      />
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderBottomWidth: 1,
    borderColor: theme.colors.gray,
    paddingBottom: 8,
  },
  input: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
});
