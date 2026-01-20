import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SHIPPING_TABLE_DATA } from '../../data/shippingMockData';
import LinearGradient from 'react-native-linear-gradient';
import { useShippingStore } from '../../store/shippingStore';

function Ship_TransactionTable({ onPickPress, filters }) {
  const navigation = useNavigation();
  const setSelectedTransaction = useShippingStore(s => s.setSelectedTransaction);
  const transactionStatusMap = useShippingStore(s => s.transactionStatusMap);

  const filteredData = useMemo(() => {
    return SHIPPING_TABLE_DATA.filter(item => {
      const effectiveStatus =
        (transactionStatusMap && transactionStatusMap[String(item.deliveryId)]) ||
        item.status;

      if (filters?.selectedPickSlip) {
        const filterPickSlip = filters.selectedPickSlip.name?.trim();
        const itemPickSlip = item.pickSlipNo?.trim();

        if (filterPickSlip && itemPickSlip !== filterPickSlip) {
          return false;
        }
      }

      if (filters?.selectedStatus) {
        const filterStatusRaw =
          typeof filters.selectedStatus === 'string'
            ? filters.selectedStatus
            : filters.selectedStatus?.name;

        const filterStatus = filterStatusRaw?.trim();
        const itemStatus = String(effectiveStatus || '').trim();

        if (filterStatus && itemStatus !== filterStatus) {
          return false;
        }
      }

      if (filters?.selectedItem) {
        const filterItem = filters.selectedItem.name?.toLowerCase();
        const itemItems = item.items || [];

        const hasMatchingItem = itemItems.some(itemObj => {
          const name = itemObj?.item ?? itemObj?.name ?? '';
          return String(name).toLowerCase().includes((filterItem || '').toLowerCase());
        });

        if (!hasMatchingItem) {
          return false;
        }
      }

      if (filters?.selectedException) {
        const filterException = filters.selectedException.name?.toLowerCase();
        const itemException = item.exception?.toLowerCase();

        if (filterException && itemException !== filterException) {
          return false;
        }
      }

      if (filters?.selectedOrganization) {
        const filterOrg = filters.selectedOrganization.name?.trim();
        const itemOrg = item.organization?.trim();

        if (filterOrg && itemOrg !== filterOrg) {
          return false;
        }
      }

      return true;
    });
  }, [filters, transactionStatusMap]);

  const handlePickButtonPress = item => {
    if (onPickPress) {
      onPickPress(item);
    }
  };

  const handleStatusPillPress = item => {
    const effectiveStatus =
      (transactionStatusMap && transactionStatusMap[String(item.deliveryId)]) ||
      item.status;

    const payload = { ...item, status: effectiveStatus };

    setSelectedTransaction(payload);
    console.log('ShippingStore Selected Transaction Payload:', payload);

    if (payload?.status === 'Pick') {
      handlePickButtonPress(payload);
      return;
    }

    if (payload?.status === 'Ready To Pack') {
      navigation.navigate('AutoPack', { order: payload, status: payload.status });
      return;
    }

    if (payload?.status === 'Ready To Ship') {
      navigation.navigate('ShipConfirmShipment', { order: payload, status: payload.status });
    }
  };

  if (filteredData.length === 0) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, styles.colDelivery]}>Delivery</Text>
            <Text style={[styles.headerText, styles.colSales]}>Sales Order No</Text>
            <Text style={[styles.headerText, styles.colLines]}>Line/Qty</Text>
            <Text style={[styles.headerText, styles.colPick]}>Pick Slip No</Text>
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No shipments found matching the selected filters
            </Text>
            <Text style={styles.noDataSubText}>Try changing your filter criteria</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, styles.colDelivery]}>Delivery ID</Text>
          <Text style={[styles.headerText, styles.colSales]}>Sales Order No</Text>
          <Text style={[styles.headerText, styles.colLines]}>Lines/Qty</Text>
          <Text style={[styles.headerText, styles.colPick, styles.centerHeader]}>
            Pick Slip No
          </Text>
        </View>
      </View>

      <View style={styles.tableWrapper}>
        <LinearGradient
          colors={['#F5F5F6', '#FFFFFF']}
          locations={[0.037, 0.0864]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.sideGradient}
        />

        <View style={styles.tableContainer}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.tableScroll}>
            {filteredData.map(item => {
              const effectiveStatus =
                (transactionStatusMap && transactionStatusMap[String(item.deliveryId)]) ||
                item.status;

              return (
                <View key={item.deliveryId} style={styles.dataRow}>
                  <View style={styles.colDelivery}>
                    <Text style={styles.cellBold} numberOfLines={1}>
                      {item.deliveryId}
                    </Text>
                    <Text style={styles.cellSmall} numberOfLines={1}>
                      {item.customer}
                    </Text>
                  </View>

                  <View style={styles.colSales}>
                    <Text style={styles.cellBold} numberOfLines={1}>
                      {item.salesOrderNo}
                    </Text>
                    <Text style={styles.cellSmall} numberOfLines={1}>
                      {item.carrier}
                    </Text>
                  </View>

                  <View style={styles.colLines}>
                    <Text style={styles.cellSmall} numberOfLines={1}>
                      Total Lines - {item.lines}
                    </Text>
                    <Text style={styles.cellSmall} numberOfLines={1}>
                      Total Qty - {item.quantity}
                    </Text>
                  </View>

                  <View style={[styles.colPick, styles.centerColumn]}>
                    <Text style={[styles.cellBold, styles.centerText]} numberOfLines={1}>
                      {item.pickSlipNo}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.pickBtn,
                        String(effectiveStatus) === 'Ready To Pack' && styles.readyBtn,
                      ]}
                      onPress={() => handleStatusPillPress(item)}
                    >
                      <Text
                        style={[
                          styles.pickText,
                          String(effectiveStatus) === 'Ready To Pack' && styles.readyText,
                        ]}
                        numberOfLines={1}
                      >
                        {effectiveStatus}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  headerContainer: {
    marginBottom: 4,
  },

  tableWrapper: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
    minHeight: 300,
  },

  sideGradient: {
    width: 6,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },

  tableContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
  },

  tableScroll: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },

  dataRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#000000',
    alignItems: 'flex-start',
  },

  headerText: {
    fontFamily: 'Mulish',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#595A5C',
    textAlign: 'left',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  cellBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#233E55',
    textAlign: 'left',
  },

  cellSmall: {
    fontSize: 12,
    color: '#242424',
    marginTop: 2,
    textAlign: 'left',
  },

  colDelivery: {
    flex: 1.2,
    paddingHorizontal: 4,
  },
  colSales: {
    flex: 1.2,
    paddingHorizontal: 4,
  },
  colLines: {
    flex: 1,
    paddingHorizontal: 4,
  },
  colPick: {
    flex: 1,
    paddingHorizontal: 4,
  },

  centerHeader: {
    textAlign: 'center',
  },

  centerColumn: {
    alignItems: 'center',
  },

  centerText: {
    textAlign: 'center',
    width: '100%',
  },

  pickBtn: {
    marginTop: 6,
    alignSelf: 'center',
    minWidth: 34,
    minHeight: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#ECF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pickText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#145DA0',
    textAlign: 'center',
  },

  readyBtn: {
    minWidth: 64,
    borderRadius: 4,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  readyText: {
    color: '#188038',
    fontSize: 8,
    fontWeight: '700',
  },

  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 20,
  },

  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 8,
  },

  noDataSubText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default Ship_TransactionTable;
