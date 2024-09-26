import React from 'react';
import { View, Text, Button } from 'react-native';
import { StyleSheet } from 'react-native';
function HomeScreen({ navigation }: { navigation: any }): JSX.Element {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Shop"
        onPress={() => navigation.navigate('Shop')} // Navigate to ShopScreen
      />
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

