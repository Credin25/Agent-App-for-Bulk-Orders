// components/Navbar.tsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

function Navbar({ navigation }: { navigation: any }) {
  return (
    <View style={styles.navbar}>
      <Button title="Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Shop" onPress={() => navigation.navigate('Shop')} />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#eee', // Change as needed
  },
});

export default Navbar;
