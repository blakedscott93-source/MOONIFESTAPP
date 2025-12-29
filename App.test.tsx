/**
 * MINIMAL TEST APP
 * Use this to test if React Native Web is working
 * If this renders, the issue is in the main App.tsx
 * If this doesn't render, the issue is with React Native Web setup
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestApp() {
  console.log('✅ TestApp rendering...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World - React Native Web is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F5FB',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1B22',
  },
});









