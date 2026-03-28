import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import { toast } from '../lib/toast';

const TYPE_STYLES = {
  success: { bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
  error: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
  info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A8A' },
};

export default function ToastHost() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({ type: 'info', text1: '', text2: '' });

  useEffect(() => {
    return toast.subscribe((payload) => {
      setCurrent({
        type: payload?.type || 'info',
        text1: payload?.text1 || '',
        text2: payload?.text2 || '',
      });
      setVisible(true);
    });
  }, []);

  const stylesByType = useMemo(() => {
    return TYPE_STYLES[current.type] || TYPE_STYLES.info;
  }, [current.type]);

  return (
    <Snackbar
      visible={visible}
      onDismiss={() => setVisible(false)}
      duration={3500}
      style={[
        styles.snackbar,
        { backgroundColor: stylesByType.bg, borderLeftColor: stylesByType.border },
      ]}
      wrapperStyle={styles.wrapper}
    >
      <View>
        {!!current.text1 && (
          <Text style={[styles.title, { color: stylesByType.text }]}>{current.text1}</Text>
        )}
        {!!current.text2 && (
          <Text style={[styles.message, { color: stylesByType.text }]}>{current.text2}</Text>
        )}
      </View>
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    top: 18,
    alignItems: 'center',
  },
  snackbar: {
    borderLeftWidth: 6,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    elevation: 6,
    shadowColor: '#0B1F33',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    width: '92%',
    maxWidth: 560,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    marginTop: 2,
    fontSize: 13,
  },
});
