import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import Toast, { BaseToast, ToastConfig } from 'react-native-toast-message';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import NewReceiveScreen from './src/screens/NewReceiveScreen';
import InCompleteReceiveScreen from './src/screens/InCompleteReceiveScreen';
import AsnReceiptScreen from './src/screens/AsnReceipt';
import IC_AsnReceiptScreen from './src/screens/IC_AsnReceipt'; 
import ReceiveSummaryScreen from './src/screens/ReceiveSummaryScreen';
import ReceivedSummaryScreen from './src/screens/ReceivedSummary'; 
import AsnReceivedScreen from './src/screens/AsnReceivedScreen'; 
import LineItemDetailsScreen from './src/screens/LineItemDetailsScreen';
import ASNPOLineItemDetailsScreen from './src/screens/ASNPOLineItemDetailsScreen';
import ASNSummaryViewItemDetailsScreen from './src/screens/ASNSummaryViewItemDetailsScreen';
import IC_ASNSummaryViewItemDetailsScreen from './src/screens/IC_ASNSummaryViewItemDetailsScreen';
import IC_ASNPOLineItemDetailsScreen from './src/screens/IC_ASNPOLineItemDetailsScreen';
import IC_LineItemDetailsScreen from './src/screens/IC_LineItemDetailsScreen';
import ScanItemDetailsScreen from './src/screens/ScanItemDetailsScreen';
import IC_ScanItemDetailsScreen from './src/screens/IC_ScanItemDetailsScreen';
import PODetailSummary from './src/screens/POdetailsummary';
import IC_PODetailSummary from './src/screens/IC_POdetailsummary'; 
import PovViewItems from './src/screens/poviewitems';
import IC_PovViewItems from './src/screens/IC_poviewitems';
import { navigationRef } from './src/api/api';
import InventoryHome from './src/screens/Inventory/Inv_Menu';
import Sub_Inv_TransferScreen from './src/screens/Inventory/Sub_Inv_TransferScreen';
import SummaryScreen from './src/screens/Inventory/Transfer_summary';
import Sub_Inv_Addmore_TransferScreen from './src/screens/Inventory/Sub_Inv_Addmore_TransferScreen';

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
name="InCompleteReceiveScreen"
component={InCompleteReceiveScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="AsnReceiptScreen"
component={AsnReceiptScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="IC_AsnReceiptScreen"
component={IC_AsnReceiptScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ReceiveSummaryScreen"
component={ReceiveSummaryScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ReceivedSummaryScreen"
component={ReceivedSummaryScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="AsnReceivedScreen"
component={AsnReceivedScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="LineItemDetails"
component={LineItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ASNPOLineItemDetails"
component={ASNPOLineItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="IC_ASNPOLineItemDetails"
component={IC_ASNPOLineItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ASNSummaryViewItemDetails"
component={ASNSummaryViewItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="IC_ASNSummaryViewItemDetails"
component={IC_ASNSummaryViewItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="IC_LineItemDetails"
component={IC_LineItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ScanItemDetails"
component={ScanItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="IC_ScanItemDetails"
component={IC_ScanItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="podetailsummary"
component={PODetailSummary}
options={{ headerShown: false }}
/>
<Stack.Screen
name="IC_podetailsummary"
component={IC_PODetailSummary}
options={{ headerShown: false }}
/>
<Stack.Screen
name="poviewitems"
component={PovViewItems}
options={{ headerShown: false }}
/>
<Stack.Screen
name="IC_poviewitems"
component={IC_PovViewItems}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Inventory"
component={InventoryHome}
options={{ headerShown: false }}
/>
<Stack.Screen
name="SubInvTransfer"
component={Sub_Inv_TransferScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="SubInvTransfer_summary"
component={SummaryScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Sub_Inv_Addmore"
component={Sub_Inv_Addmore_TransferScreen}
options={{ headerShown: false }}
/>
</Stack.Navigator>
      <Toast config={toastConfig} />
</NavigationContainer>
</>
);
}

export default App;