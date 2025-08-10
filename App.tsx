import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message'; 

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import NewReceiveScreen from './src/screens/NewReceiveScreen';
import ReceiveSummaryScreen from './src/screens/ReceiveSummaryScreen'; 
import LineItemDetailsScreen from './src/screens/LineItemDetailsScreen'; 

const Stack = createNativeStackNavigator();

function App() {
return (
<>
<NavigationContainer>
<Stack.Navigator initialRouteName="Login">
<Stack.Screen
name="Login"
component={LoginScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Home"
component={HomeScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Receive"
component={ReceiveScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="NewReceiveScreen"
component={NewReceiveScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ReceiveSummaryScreen"
component={ReceiveSummaryScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="LineItemDetails"
component={LineItemDetailsScreen}
options={{ headerShown: false }}
/>
</Stack.Navigator>
</NavigationContainer>

  <Toast />
</>
);
}

export default App;