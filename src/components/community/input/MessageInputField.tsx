
import React, { useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";

interface MessageInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder: string;
  disabled?: boolean;
  isFocused: boolean;
  maxLength?: number;
}

const MessageInputField: React.FC<MessageInputFieldProps> = ({
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder,
  disabled = false,
  isFocused,
  maxLength = 2000
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea and focus management
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className={`min-h-[56px] max-h-[200px] py-4 pl-4 pr-40 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none rounded-2xl transition-all duration-200 ${isFocused ? 'shadow-lg' : ''}`}
      disabled={disabled}
      maxLength={maxLength}
    />
  );
};

export default MessageInputField;
