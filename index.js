import './gesture-handler';
/**
 * @format
 */
import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';  // Import Provider from react-redux
import store from './store/store';  // Import your store
import App from './App';  // Your main App component
import { name as appName } from './app.json';

const RootApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => RootApp);
