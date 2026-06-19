import React from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './toastConfig';

export default function ToastHost() {
  return <Toast config={toastConfig} />;
}
