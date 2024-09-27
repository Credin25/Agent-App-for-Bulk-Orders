import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
function ShopScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text>Shop Screen</Text>
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

