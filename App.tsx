import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import Toast, { BaseToast, ToastConfig } from 'react-native-toast-message';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import NewReceiveScreen from './src/screens/NewReceiveScreen';
import AsnReceiptScreen from './src/screens/AsnReceipt'; 
import ReceiveSummaryScreen from './src/screens/ReceiveSummaryScreen'; 
import LineItemDetailsScreen from './src/screens/LineItemDetailsScreen';
import PODetailSummary from './src/screens/POdetailsummary'; 
import PovViewItems from './src/screens/ASN/poviewitems';
import { navigationRef } from './src/api/api';

const Stack = createNativeStackNavigator();

const toastConfig: ToastConfig = {
  orange: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'orange' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}
      text2Style={{ fontSize: 14, color: '#555' }}
    />
  ),
};

function App() {
return (
<>
<NavigationContainer ref={navigationRef}>
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
name="AsnReceiptScreen"
component={AsnReceiptScreen}
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
<Stack.Screen
name="podetailsummary"
component={PODetailSummary}
options={{ headerShown: false }}
/>
<Stack.Screen
name="poviewitems"
component={PovViewItems}
options={{ headerShown: false }}
/>
</Stack.Navigator>
      <Toast config={toastConfig} />
</NavigationContainer>
</>
);
}

export default App;