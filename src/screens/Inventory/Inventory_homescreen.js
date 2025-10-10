import React from "react";
import { StyleSheet,View,Text, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import GlobalHeaderComponent from "../../components/GlobalHeaderComponent";
import { useReceivingStore } from "../../store/receivingStore";
import { useNavigation } from "@react-navigation/native";
import SwappedICon from '../../assets/images/Swapped.png';
import InventoryIcon from '../../assets/images/inventory_icon.png';
import OrgIcon from '../../assets/images/org_icon.png';

const InventoryHome = ()=>{
      const { resetReceiving, OrgData, ActiveTab, setActiveTab } = useReceivingStore();
      const navigation = useNavigation();

return (
        <GestureHandlerRootView style={{ flex: 1, paddingBottom:80,backgroundColor:'#FFFFFF' }}>
          <GlobalHeaderComponent organizationName={OrgData?.selectedOrgCode} screenTitle="Receiving" notificationCount={0} onBack={() => navigation.navigate('Home')} />
          <View style={styles.incompleteRowContainer}>
            <View style={[styles.card, styles.cardInsideSwipe]}>
               <Image
                source={SwappedICon}
                style={{ width: 24, height: 24, tintColor: '#233E55', marginRight:20 }}
               />
               <Text style={styles.label}>Sub Inventory Transfer</Text>
            </View>
            <View style={[styles.card, styles.cardInsideSwipe]}>
               <Image
                source={OrgIcon}
                style={{ width: 24, height: 24, tintColor: '#233E55', marginRight:20 }}
               />
               <Text style={styles.label}>organizations Transfer</Text>
            </View>
            <View style={[styles.card, styles.cardInsideSwipe]}>
               <Image
                source={InventoryIcon}
                style={{ width: 24, height: 24, tintColor: '#233E55', marginRight:20 }}
               />
               <Text style={styles.label}>Inventory Adjustments</Text>
            </View>
          </View>
        </GestureHandlerRootView>
)
}

const styles = StyleSheet.create({
  container: { flex: 1},
  card: { justifyContent: 'flex-start', backgroundColor: '#F5F5F6',
     flexDirection:'row', marginHorizontal: 12,
      marginVertical:6, borderRadius: 8, padding: 20,
       elevation: 2, shadowColor: '#000', 
       shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 8, marginBottom:20},
  cardInsideSwipe: { marginHorizontal: 0, marginVertical: 0, borderRadius: 8 },
    incompleteRowContainer: {
    marginTop:20,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    // backgroundColor: '#FBFBFB',
    overflow: 'hidden',
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    justifyContent:'space-between'
  },
  label: {
    fontFamily: 'Mulish',
    fontWeight: 700,
    fontStyle: 'Bold',
    fontSize: 16,
    color:'#233E55'
  }
});

export default InventoryHome;