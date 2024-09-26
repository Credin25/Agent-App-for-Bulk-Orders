import React from 'react';
import { View, Text, Button } from 'react-native';
import { StyleSheet } from 'react-native';
function ShopScreen({ navigation }: { navigation: any }): JSX.Element {
  return (
    <View style={styles.container}>
      <Text>Shop Screen</Text>
      <Button
        title="Go back to Home"
        onPress={() => navigation.goBack()} // Navigate back to HomeScreen
      />
    </View>
  );
}

export default ShopScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

