import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

const baseStyle = {
  borderLeftWidth: 6,
  borderRadius: 14,
  minHeight: 64,
  paddingVertical: 8,
  shadowColor: '#0B1F33',
  shadowOpacity: 0.15,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};

const text1Style = {
  fontSize: 15,
  fontWeight: '700',
  color: '#0F172A',
};

const text2Style = {
  fontSize: 13,
  color: '#475569',
};

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: '#22C55E',
        backgroundColor: '#F0FDF4',
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={text1Style}
      text2Style={text2Style}
      text2NumberOfLines={3}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: '#EF4444',
        backgroundColor: '#FEF2F2',
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={text1Style}
      text2Style={text2Style}
      text2NumberOfLines={3}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        ...baseStyle,
        borderLeftColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
      }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={text1Style}
      text2Style={text2Style}
      text2NumberOfLines={3}
    />
  ),
};
