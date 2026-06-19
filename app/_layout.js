import React from 'react';
import { Stack } from 'expo-router';
import ToastHost from '../components/ToastHost';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, 
        }}
      />
      <ToastHost />
    </>
  );
}
