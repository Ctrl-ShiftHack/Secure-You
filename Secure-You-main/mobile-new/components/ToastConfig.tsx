import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
      <View style={styles.toastTextContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <MaterialCommunityIcons name="alert-circle" size={24} color="#ef4444" />
      <View style={styles.toastTextContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <MaterialCommunityIcons name="information" size={24} color="#667eea" />
      <View style={styles.toastTextContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  successToast: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  errorToast: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  infoToast: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  toastTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  toastMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
