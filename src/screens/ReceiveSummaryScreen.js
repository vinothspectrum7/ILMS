import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';
import POinfoCardComponent from '../components/POinfoCardComponent';
import ConfirmLineItemComponent from '../components/ConfirmLineItemComponent';
import FooterButtonsComponent from '../components/FooterButtonsComponent';
import SummaryTabHdrComponent from '../components/SummaryTabHdrComponent';
import ConfirmModalComponent from '../components/ConfirmModalComponent';
import Toast from 'react-native-toast-message';
import { createOrderReceipt } from '../api/mockApi';

const ReceiveSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const initialItems = Array.isArray(route?.params?.selectedItems)
    ? route.params.selectedItems
    : [];
  const [items] = useState(initialItems);

  const [modalVisible, setModalVisible] = useState(false);

  const confirmAction = async () => {
    try {
      const response = await createOrderReceipt(items, true);
      if (response?.ok) {
        return { success: true, message: response?.message || 'Order receipt created successfully' };
      } else {
        return { success: false, message: response?.message || 'Failed to create order receipt' };
      }
    } catch (error) {
      return { success: false, message: error?.message || 'Network error. Please try again.' };
    }
  };

  const handleCancel = () => setModalVisible(false);

  const handleSuccess = () => {
    Toast.show({
      type: 'success',
      text1: 'Order receipt created successfully',
      position: 'top',
      visibilityTime: 1500,
    });
    setModalVisible(false);
  };

  const handleFailure = () => {
    Toast.show({
      type: 'error',
      text1: 'Failed to create receipt',
      position: 'top',
      visibilityTime: 1500,
    });
    setModalVisible(false);
  };

  const openConfirmModal = () => setModalVisible(true);

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeaderComponent
        title="Receive"
        greetingName="Robert"
        dateText="06-08-2025"
        onBack={() => navigation.goBack()}
        onMenu={() => {}}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <POinfoCardComponent
          receiptNumber="12300002"
          supplier="3DIng"
          poNumber="PO-00002"
          receiptDate="21 Jul 2025"
        />

        <View style={styles.tableHeader}>
          <SummaryTabHdrComponent />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.lineItemWrapper}>
              <ConfirmLineItemComponent
                item={item}
                readOnly={true}
                isSelected={true}
                onCheckToggle={() => {}}
                onQtyChange={() => {}}
              />
            </View>
          )}
          scrollEnabled={false}
          ListEmptyComponent={<View style={{ height: 16 }} />}
        />
      </ScrollView>

      <FooterButtonsComponent
        leftLabel="Save"
        rightLabel="Confirm"
        onLeftPress={openConfirmModal}
        onRightPress={openConfirmModal}
        leftEnabled={true}
        rightEnabled={true}
      />

      <ConfirmModalComponent
        visible={modalVisible}
        title="Confirmation"
        message="Are you sure want to confirm this order?"
        confirmAction={confirmAction}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { paddingBottom: 120 },
  tableHeader: { marginTop: 8, marginBottom: 10 },
  lineItemWrapper: { marginBottom: 12 },
});

export default ReceiveSummaryScreen;
