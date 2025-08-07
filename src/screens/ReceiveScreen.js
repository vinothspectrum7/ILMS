import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { ArrowLeft, Menu, ScanBarcode } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const initialLayout = { width: Dimensions.get('window').width };

const poData = [
  {
    id: '1',
    poNumber: 'PO-00002',
    supplier: '3DIng',
    poDate: '21 JUL 2025',
    status: 'OPEN',
    received: 40,
    billed: 60,
  },
  {
    id: '2',
    poNumber: 'PO-00003',
    supplier: 'TechCo',
    poDate: '22 JUL 2025',
    status: 'OPEN',
    received: 55,
    billed: 80,
  },
  {
    id: '3',
    poNumber: 'PO-00004',
    supplier: 'DesignHub',
    poDate: '23 JUL 2025',
    status: 'OPEN',
    received: 70,
    billed: 75,
  },
  {
    id: '4',
    poNumber: 'PO-00005',
    supplier: 'BuildCorp',
    poDate: '24 JUL 2025',
    status: 'OPEN',
    received: 90,
    billed: 90,
  },
];

const ReceiveScreen = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(poData);

  const [routes] = useState([
    { key: 'poir', title: 'PO/IR' },
    { key: 'asn', title: 'ASN' },
    { key: 'received', title: 'Received' },
    { key: 'inprogress', title: 'In-progress' },
  ]);

  const handleSearch = (text) => {
    setSearchText(text);
    const newData = poData.filter((item) =>
      item.poNumber.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(newData);
  };

  const POList = () => (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 80 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('NewReceiveScreen', { selectedPO: item })}
          activeOpacity={0.9}
        >
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.row}>
                <Text style={styles.labelText}>PO Number</Text>
                <Text style={styles.valueText}>{item.poNumber}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.labelText}>PO Status</Text>
                <Text style={[styles.valueText, styles.openText]}>{item.status}</Text>
              </View>
              <Text style={styles.subLabel}>Received</Text>
              <View style={styles.progressWrapper}>
                <View style={[styles.progressBar, { width: `${item.received}%` }]} />
              </View>
            </View>

            <View style={styles.cardRight}>
              <View style={styles.row}>
                <Text style={styles.labelText}>Supplier</Text>
                <Text style={styles.valueText}>{item.supplier}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.labelText}>PO Order Date</Text>
                <Text style={styles.valueText}>{item.poDate}</Text>
              </View>
              <Text style={styles.subLabel}>Billed</Text>
              <View style={styles.progressWrapper}>
                <View style={[styles.progressBar, { width: `${item.billed}%` }]} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const renderScene = {
    poir: POList,
    asn: POList,
    received: POList,
    inprogress: POList,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive</Text>
        <TouchableOpacity>
          <Menu color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter PO/IR/ASN"
          placeholderTextColor="#999"
          style={styles.input}
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => navigation.navigate('NewReceiveScreen')}>
          <ScanBarcode color="#233E55" size={24} />
        </TouchableOpacity>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap(renderScene)}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#233E55', height: 3 }}
            style={{ backgroundColor: '#fff', elevation: 0 }}
            scrollEnabled
            tabStyle={{ width: 'auto', paddingHorizontal: 10 }}
            activeColor="#233E55"
            inactiveColor="#444"
            renderLabel={({ route, focused, color }) => (
              <Text
                style={{
                  color,
                  fontWeight: focused ? 'bold' : 'normal',
                  fontSize: 12,
                }}
              >
                {route.title}
              </Text>
            )}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#233E55',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    margin: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 6,
  },
  cardRight: {
    flex: 1,
    paddingLeft: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    color: '#555',
    flex: 1,
  },
  valueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1C1C1C',
    flex: 1,
    textAlign: 'left',
  },
  openText: {
    color: 'green',
  },
  subLabel: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
    marginBottom: 2,
  },
  progressWrapper: {
    backgroundColor: '#E5F8F7',
    borderRadius: 20,
    height: 12,
    width: '75%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 4,
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1C3C55',
    borderRadius: 20,
    marginHorizontal: 4,
  },
});

export default ReceiveScreen;
