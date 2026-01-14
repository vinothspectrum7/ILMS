import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import Toast, { BaseToast, ToastConfig } from 'react-native-toast-message';

import LoginScreen from './src/screens/LoginScreen';
import ForgetPassword from './src/screens/ForgetPassword';
import NotificationScreen from './src/screens/NotificationScreen';
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
import Sub_Inv_Edit_TransferScreen from './src/screens/Inventory/Sub_Inv_Edit_TransferScreen';
import Org_Transfer_Screen from './src/screens/Inventory/Org_Transfer/homescreen';
import Org_TransferSummaryScreen from './src/screens/Inventory/Org_Transfer/summaryscreen';
import Org_EditTransfer_Screen from './src/screens/Inventory/Org_Transfer/EditScreen';
import Org_AddMoreTransfer_Screen from './src/screens/Inventory/Org_Transfer/addmorescreen';
import Inv_Adjustment_AddScreen from './src/screens/Inventory/Inv_Adjustment_AddScreen';
import Inv_Adj_AddmoreScreen from './src/screens/Inventory/Inv_Adj_AddmoreScreen';
import Inv_Adj_EditScreen from './src/screens/Inventory/Inv_Adj_EditScreen';
import Inv_Adj_SummaryScreen from './src/screens/Inventory/Inv_Adj_SummaryScreen';
import SettingsScreen from './src/screens/Profile/profile';
import ChangePassword from './src/screens/Profile/ChangePassword';
import Sub_Inv_TransferSummaryScreen from './src/screens/Inventory/Sub_Inv_TransferSummaryScreen';
import Rec_ViewItemDetailsScreen from './src/screens/Receive/Rec_ViewItemDetailsScreen';
import Rec_ViewReceiptItemDetailsScreen from './src/screens/Receive/Rec_ViewReceiptItemDetailsScreen';
import Rec_ViewReceivedItemDetailsScreen from './src/screens/Receive/Rec_ViewReceivedItemDetailsScreen';
import Ship_Entry from './src/screens/Shipping/Ship_Entry';
import Ship_Dashboard from './src/screens/Shipping/Ship_Dashboard';
import Pick from './src/screens/Shipping/Pick';
import AutoPack from './src/screens/Shipping/AutoPack';
import Ship_ConfirmPack from './src/components/shipping/Ship_ConfirmPack';
import Ship_ConfirmShippment from './src/screens/Shipping/Ship_ConfirmShippment';
import ManualPick from './src/screens/Shipping/ManualPick';
import Ship_LabelPrintListScreen from './src/screens/Shipping/Ship_LabelPrintListScreen';
import ManualPack from './src/screens/Shipping/ManualPack';
import Ship_ManConfirmPack from './src/components/shipping/Ship_ManConfirmPack';
import Ship_PrintDocumentScreen from './src/screens/Shipping/Ship_PrintDocumentScreen';

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
name="Notification"
component={NotificationScreen}
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
name="orgTransfer"
component={Org_Transfer_Screen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="orgSummary"
component={Org_TransferSummaryScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Org_Edit_TransferScreen"
component={Org_EditTransfer_Screen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Org_Transfer_Addmore"
component={Org_AddMoreTransfer_Screen}
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
<Stack.Screen
name="Sub_Inv_Edit_TransferScreen"
component={Sub_Inv_Edit_TransferScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Inv_Adjustment_AddScreen"
component={Inv_Adjustment_AddScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Inv_Adj_SummaryScreen"
component={Inv_Adj_SummaryScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Inv_Adj_EditScreen"
component={Inv_Adj_EditScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Inv_Adj_AddmoreScreen"
component={Inv_Adj_AddmoreScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="settings"
component={SettingsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ForgetPassword"
component={ForgetPassword}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ChangePassword"
component={ChangePassword}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Sub_Inv_TransferSummaryScreen"
component={Sub_Inv_TransferSummaryScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Rec_ViewItemDetailsScreen"
component={Rec_ViewItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Rec_ViewReceiptItemDetailsScreen"
component={Rec_ViewReceiptItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Rec_ViewReceivedItemDetailsScreen"
component={Rec_ViewReceivedItemDetailsScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Ship_Entry"
component={Ship_Entry}
options={{ headerShown: false }}
/>
<Stack.Screen
name="ShipDashboard"
component={Ship_Dashboard}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Pick"
component={Pick}
options={{ headerShown: false }}
/>
<Stack.Screen
name="AutoPack"
component={AutoPack}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Ship_ConfirmPack"
component={Ship_ConfirmPack}
options={{ headerShown: false }}
/>
<Stack.Screen
  name="ShipConfirmShipment"
  component={Ship_ConfirmShippment}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="ManualPick"
  component={ManualPick}
  options={{ headerShown: false }}
/>
<Stack.Screen
name="ManualPack"
component={ManualPack}
options={{ headerShown: false }}
/>
 <Stack.Screen
    name="Ship_ManConfirmPack"
    component={Ship_ManConfirmPack}
    options={{ headerShown: false }}
  />

<Stack.Screen
name="Ship_LabelPrintListScreen"
component={Ship_LabelPrintListScreen}
options={{ headerShown: false }}
/>
<Stack.Screen
name="Ship_PrintDocumentScreen"
component={Ship_PrintDocumentScreen}
options={{ headerShown: false }}
/>
</Stack.Navigator>
      <Toast config={toastConfig} />
</NavigationContainer>
</>
);
}

export default App;