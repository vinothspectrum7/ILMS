import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import FilterIcon from '../../assets/icons/Ship_Icons/FilterIcon.svg';
import DropdownIcon from '../../assets/icons/Ship_Icons/DropdownIcon.svg';
import DropDown from '../../assets/icons/Ship_Icons/DropDown.svg';
import Ship_DropDown from './Ship_DropDown';
import { useReceivingStore } from '../../store/receivingStore';
import { GetShippingSalesOrderNumData, GetShippingDeliveryIdData, GetShippingPickSlipNumData } from '../../api/ApiServices';

const screenWidth = Dimensions.get('window').width;

function FilterBar({ filters, onFilterChange }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [pickSearchText, setPickSearchText] = useState(filters?.pickSearchText ?? '');
  const [pickSuggestions, setPickSuggestions] = useState(filters?.pickSuggestions ?? []);
  const [pickLoading, setPickLoading] = useState(false);

  const debounceRef = useRef(null);
  const activeRequestRef = useRef(0);
  const pickInputRef = useRef(null);

  const headers = ['Pick Option', 'Status', 'Item', 'Exception', 'Organization'];
  const statusOptions = ['Pick', 'Ready To Pack', 'Ready To Ship'];

  const itemItems = useMemo(
    () => [
      { id: 1, name: 'Item A' },
      { id: 2, name: 'Item B' },
      { id: 3, name: 'Item C' },
      { id: 4, name: 'Item D' },
      { id: 5, name: 'Item E' },
      { id: 6, name: 'Item F' },
    ],
    []
  );

  const exceptionItems = useMemo(
    () => [
      { id: 1, name: 'None' },
      { id: 2, name: 'Damaged' },
      { id: 3, name: 'Missing' },
      { id: 4, name: 'Delayed' },
    ],
    []
  );

  const organizationItems = useMemo(
    () => [
      { id: 1, name: 'ENV' },
      { id: 2, name: 'ORG1' },
      { id: 3, name: 'ORG2' },
    ],
    []
  );

  const getChipLayout = () => {
    if (screenWidth < 375) return 'column';
    return 'row';
  };

  const getChipGap = () => {
    if (screenWidth < 375) return 6;
    if (screenWidth < 414) return 8;
    return 10;
  };

  const getDropdownPadding = () => {
    if (screenWidth < 375) return 12;
    if (screenWidth < 414) return 14;
    return 16;
  };

  const getItemWidth = header => {
    const baseWidth = 20;
    const iconWidth = 20;
    const charWidth = 8;

    const textWidth = header.length * charWidth;
    const totalWidth = baseWidth + iconWidth + textWidth;

    const minWidth = 90;
    const maxWidth = 150;

    return Math.max(minWidth, Math.min(totalWidth, maxWidth));
  };

  const responsiveStyles = {
    chipLayout: getChipLayout(),
    chipGap: getChipGap(),
    dropdownPadding: getDropdownPadding(),
  };

  const getPickPlaceholder = () => {
    if (filters?.pickType === 'Sales Order') return 'Search Sales Order No';
    if (filters?.pickType === 'Delivery') return 'Search Delivery ID';
    return 'Search Pick Slip Number';
  };

  const getDisplayValueFromRow = row => {
    if (!row) return '';
    if (filters?.pickType === 'Sales Order') return String(row.sales_order_no ?? '');
    if (filters?.pickType === 'Delivery') return String(row.delivery_id ?? '');
    return String(row.pick_slip_number ?? '');
  };

  const normalizeSuggestions = rows => {
    if (!Array.isArray(rows)) return [];
    const key =
      filters?.pickType === 'Sales Order'
        ? 'sales_order_no'
        : filters?.pickType === 'Delivery'
          ? 'delivery_id'
          : 'pick_slip_number';

    const seen = new Set();
    const unique = [];

    for (const r of rows) {
      const v = String(r?.[key] ?? '').trim();
      if (!v) continue;
      if (seen.has(v)) continue;
      seen.add(v);
      unique.push(r);
    }
    return unique;
  };

  const resetPickOptionResultsOnly = () => {
    onFilterChange('pickSuggestions', []);
    onFilterChange('pickOptionSelected', null);
    onFilterChange('pickOptionResults', []);
    setPickSuggestions([]);
  };

  useEffect(() => {
    setPickSearchText(filters?.pickSearchText ?? '');
  }, [filters?.pickSearchText]);

  useEffect(() => {
    if (activeDropdown !== 'Pick Option') return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const text = String(pickSearchText ?? '');

    onFilterChange('pickSearchText', text);

    if (text.trim().length === 0) {
      setPickLoading(false);
      resetPickOptionResultsOnly();
      return;
    }

    if (text.trim().length < 3) {
      setPickLoading(false);
      setPickSuggestions([]);
      onFilterChange('pickSuggestions', []);
      return;
    }

    if (filters?.pickType === 'Delivery'){

      debounceRef.current = setTimeout(async () => {
      try {
        setPickLoading(true);

        const currentReq = ++activeRequestRef.current;

        const orgCode = parseInt(
          useReceivingStore.getState()?.OrgData?.selectedOrg ??
            useReceivingStore.getState()?.OrgData?.selectedOrg,
          10
        );

        const resp = await GetShippingDeliveryIdData(orgCode, text.trim());
        console.log(resp,'GetShippingPickSlipNumDataGetShippingPickSlipNumDataGetShippingPickSlipNumData')
        if (currentReq !== activeRequestRef.current) return;

        const rows = resp?.shipment_orders ?? [];
        const normalized = normalizeSuggestions(rows);

        setPickSuggestions(normalized);
        onFilterChange('pickSuggestions', normalized);

        setPickLoading(false);
      } catch (e) {
        setPickLoading(false);
        setPickSuggestions([]);
        onFilterChange('pickSuggestions', []);
      }
    }, 450);

    }

    else if (filters?.pickType === 'Sales Order'){ 

      debounceRef.current = setTimeout(async () => {
      try {
        setPickLoading(true);

        const currentReq = ++activeRequestRef.current;

        const orgCode = parseInt(
          useReceivingStore.getState()?.OrgData?.selectedOrg ??
            useReceivingStore.getState()?.OrgData?.selectedOrg,
          10
        );

        const resp = await GetShippingSalesOrderNumData(orgCode, text.trim());
        console.log(resp,'GetShippingPickSlipNumDataGetShippingPickSlipNumDataGetShippingPickSlipNumData')
        if (currentReq !== activeRequestRef.current) return;

        const rows = resp?.shipment_orders ?? [];
        const normalized = normalizeSuggestions(rows);

        setPickSuggestions(normalized);
        onFilterChange('pickSuggestions', normalized);

        setPickLoading(false);
      } catch (e) {
        setPickLoading(false);
        setPickSuggestions([]);
        onFilterChange('pickSuggestions', []);
      }
    }, 450);

    } 

    else {

    debounceRef.current = setTimeout(async () => {
      try {
        setPickLoading(true);

        const currentReq = ++activeRequestRef.current;

        const orgCode = parseInt(
          useReceivingStore.getState()?.OrgData?.selectedOrg ??
            useReceivingStore.getState()?.OrgData?.selectedOrg,
          10
        );

        const resp = await GetShippingPickSlipNumData(orgCode, text.trim());
        console.log(resp,'GetShippingPickSlipNumDataGetShippingPickSlipNumDataGetShippingPickSlipNumData')
        if (currentReq !== activeRequestRef.current) return;

        const rows = resp?.shipment_orders ?? [];
        const normalized = normalizeSuggestions(rows);

        setPickSuggestions(normalized);
        onFilterChange('pickSuggestions', normalized);

        setPickLoading(false);
      } catch (e) {
        setPickLoading(false);
        setPickSuggestions([]);
        onFilterChange('pickSuggestions', []);
      }
    }, 450);

  }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pickSearchText, filters?.pickType, activeDropdown]);

  useEffect(() => {
    if (activeDropdown !== 'Pick Option') return;
    const t = setTimeout(() => {
      pickInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [activeDropdown]);

  const handlePickTypeChange = type => {
    onFilterChange('pickType', type);
    onFilterChange('pickSearchText', '');
    onFilterChange('pickSuggestions', []);
    onFilterChange('pickOptionSelected', null);
    onFilterChange('pickOptionResults', []);
    setPickSuggestions([]);
    setPickSearchText('');
    setPickLoading(false);

    const t = setTimeout(() => {
      pickInputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  };

  const handlePickSuggestionSelect = row => {
    const display = getDisplayValueFromRow(row);
    setPickSearchText(display);
    onFilterChange('pickSearchText', display);
    setPickSuggestions([]);
    onFilterChange('pickSuggestions', []);
    const t = setTimeout(() => pickInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  };

  const handleSearchPress = async () => {
    const text = String(pickSearchText ?? '').trim();
    if (text.length === 0) {
      resetPickOptionResultsOnly();
      return;
    }

    try {
      setPickLoading(true);

      const orgCode = parseInt(
        useReceivingStore.getState()?.OrgData?.selectedOrg ??
          useReceivingStore.getState()?.OrgData?.selectedOrg,
        10
      );

      const resp = await GetShippingPickSlipNumData(orgCode, text);
      console.log(resp,'GetShippingPickSlipNumDataGetShippingPickSlipNumDataGetShippingPickSlipNumData')
      const rows = resp?.shipment_orders ?? [];

      onFilterChange('pickOptionResults', rows);
      onFilterChange('pickOptionSelected', { type: 'SEARCH', value: text });

      setPickSuggestions([]);
      onFilterChange('pickSuggestions', []);

      setPickLoading(false);
      setActiveDropdown(null);
      Keyboard.dismiss();
    } catch (e) {
      setPickLoading(false);
      onFilterChange('pickOptionResults', []);
      onFilterChange('pickOptionSelected', null);
      setPickSuggestions([]);
      onFilterChange('pickSuggestions', []);
    }
  };

  const handleStatusChange = status => {
    if (filters.selectedStatus === status) {
      onFilterChange('selectedStatus', null);
    } else {
      onFilterChange('selectedStatus', status);
    }
    setActiveDropdown(null);
  };

  const handleItemChange = value => {
    onFilterChange('selectedItem', value);
    setActiveDropdown(null);
  };

  const handleExceptionChange = value => {
    onFilterChange('selectedException', value);
    setActiveDropdown(null);
  };

  const handleOrganizationChange = value => {
    onFilterChange('selectedOrganization', value);
    setActiveDropdown(null);
  };

  const isFilterActive = header => {
    switch (header) {
      case 'Pick Option':
        return !!filters?.pickOptionSelected;
      case 'Status':
        return !!filters.selectedStatus;
      case 'Item':
        return !!filters.selectedItem;
      case 'Exception':
        return !!filters.selectedException;
      case 'Organization':
        return !!filters.selectedOrganization;
      default:
        return false;
    }
  };

  const renderPickOptionContent = () => {
    return (
      <View style={[styles.pickDropdown, { padding: responsiveStyles.dropdownPadding }]}>
        <Text style={styles.pickHeading}>Pick Option</Text>

        <View
          style={[
            styles.pickRow,
            {
              flexDirection: responsiveStyles.chipLayout,
              gap: responsiveStyles.chipGap,
            },
          ]}
        >
          {['Sales Order', 'Delivery', 'Pick Slip Number'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.pickChip, filters.pickType === type && styles.pickChipActive]}
              onPress={() => handlePickTypeChange(type)}
            >
              <Text style={styles.pickChipText} numberOfLines={1}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.autoCompleteWrapper}>
          <View style={styles.autoCompleteInputRow}>
            <TextInput
              ref={pickInputRef}
              value={pickSearchText}
              onChangeText={txt => setPickSearchText(txt)}
              placeholder={getPickPlaceholder()}
              placeholderTextColor="#9AA7B2"
              style={styles.autoCompleteInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={handleSearchPress}
              blurOnSubmit={false}
              onPressIn={() => pickInputRef.current?.focus()}
            />

            {pickLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#233E55" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.searchBox}
                onPress={handleSearchPress}
                disabled={String(pickSearchText ?? '').trim().length === 0}
              >
                <Text
                  style={[
                    styles.searchText,
                    String(pickSearchText ?? '').trim().length === 0 && { opacity: 0.35 },
                  ]}
                >
                  Search
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {Array.isArray(pickSuggestions) && pickSuggestions.length > 0 && (
            <View style={styles.suggestionBox}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                style={styles.suggestionScroll}
              >
                {pickSuggestions.map((row, idx) => {
                  const label = getDisplayValueFromRow(row);
                  return (
                    <TouchableOpacity
                      key={`${label}-${idx}`}
                      style={styles.suggestionRow}
                      onPress={() => handlePickSuggestionSelect(row)}
                    >
                      <Text style={styles.suggestionText} numberOfLines={1}>
                        {label}
                      </Text>
                      <DropDown width={14} height={14} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {String(pickSearchText ?? '').trim().length > 0 &&
            String(pickSearchText ?? '').trim().length < 3 && (
              <Text style={styles.helperText}>Type at least 3 characters to search</Text>
            )}
        </View>
      </View>
    );
  };

  const renderDropdownContent = () => {
    if (!activeDropdown) return null;

    switch (activeDropdown) {
      case 'Pick Option':
        return renderPickOptionContent();

      case 'Status':
        return (
          <View style={[styles.pickDropdown, { padding: responsiveStyles.dropdownPadding }]}>
            <Text style={styles.pickHeading}>Status</Text>

            <View
              style={[
                styles.pickRow,
                {
                  flexDirection: responsiveStyles.chipLayout,
                  gap: responsiveStyles.chipGap,
                },
              ]}
            >
              {statusOptions.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.pickChip,
                    filters.selectedStatus === status && styles.pickChipActive,
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <Text style={styles.pickChipText} numberOfLines={1}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'Item':
        return (
          <View style={[styles.pickDropdown, { padding: responsiveStyles.dropdownPadding }]}>
            <Text style={styles.pickHeading}>Item</Text>
            <View style={styles.dropdownContainer}>
              <Ship_DropDown
                placeholder="Select Item"
                value={filters.selectedItem}
                onChange={handleItemChange}
                items={itemItems}
                showSearch={true}
                containerStyle={{ marginBottom: 0 }}
                inputStyle={styles.customDropdownInput}
              />
            </View>
          </View>
        );

      case 'Exception':
        return (
          <View style={[styles.pickDropdown, { padding: responsiveStyles.dropdownPadding }]}>
            <Text style={styles.pickHeading}>Exception</Text>
            <View style={styles.dropdownContainer}>
              <Ship_DropDown
                placeholder="Select Exception"
                value={filters.selectedException}
                onChange={handleExceptionChange}
                items={exceptionItems}
                showSearch={true}
                containerStyle={{ marginBottom: 0 }}
                inputStyle={styles.customDropdownInput}
              />
            </View>
          </View>
        );

      case 'Organization':
        return (
          <View style={[styles.pickDropdown, { padding: responsiveStyles.dropdownPadding }]}>
            <Text style={styles.pickHeading}>Organization</Text>
            <View style={styles.dropdownContainer}>
              <Ship_DropDown
                placeholder="Select Organization"
                value={filters.selectedOrganization}
                onChange={handleOrganizationChange}
                items={organizationItems}
                showSearch={true}
                containerStyle={{ marginBottom: 0 }}
                inputStyle={styles.customDropdownInput}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const handleCloseDropdown = () => {
    setActiveDropdown(null);
  };

  const getTotalItemsWidth = () => {
    return headers.reduce((total, header) => total + getItemWidth(header) + 6, 0);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.filterIconContainer}>
          <FilterIcon width={25} height={26} />
        </View>

        <View style={styles.divider} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { minWidth: Math.min(getTotalItemsWidth(), screenWidth - 50) },
          ]}
        >
          {headers.map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.dropdown,
                {
                  width: getItemWidth(item),
                  minWidth: getItemWidth(item),
                },
                isFilterActive(item) && styles.dropdownFiltered,
                activeDropdown === item && styles.dropdownActive,
              ]}
              onPress={() => setActiveDropdown(activeDropdown === item ? null : item)}
            >
              <Text
                style={styles.dropdownText}
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit={false}
              >
                {item}
              </Text>
              <DropdownIcon
                width={14}
                height={14}
                style={{
                  transform: [{ rotate: activeDropdown === item ? '180deg' : '0deg' }],
                }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeDropdown && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.overlay}
            onPress={handleCloseDropdown}
          />
          <View style={styles.fullScreenDropdownWrapper}>
            <View style={styles.fullScreenDropdownContainer}>{renderDropdownContent()}</View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: -15,
    position: 'relative',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    width: '100%',
    paddingHorizontal: 8,
    backgroundColor: '#ECF1F7',
    borderRadius: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  overlay: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  filterIconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  divider: {
    width: 0.5,
    height: 24,
    backgroundColor: '#B1CADE',
    marginHorizontal: 6,
    flexShrink: 0,
  },
  scrollView: {
    flex: 1,
    overflow: 'visible',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    flexGrow: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 34,
    marginRight: 6,
    justifyContent: 'space-between',
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
    flexShrink: 0,
  },
  dropdownActive: {
    backgroundColor: '#B1CADE',
    borderColor: '#233E55',
  },
  dropdownFiltered: {
    backgroundColor: '#B1CADE',
  },
  dropdownText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#242424',
    marginRight: 6,
    flex: 1,
    textAlign: 'left',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 12,
  },
  fullScreenDropdownWrapper: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
    elevation: 6,
  },
  fullScreenDropdownContainer: {
    width: '100%',
    paddingHorizontal: 8,
  },
  pickDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E4EE',
    width: '100%',
    shadowColor: '#00000040',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  pickHeading: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#233E55',
    marginBottom: 12,
    lineHeight: 12,
    letterSpacing: 0,
  },
  pickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickChip: {
    borderWidth: 1,
    borderColor: '#D9E4EE',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  pickChipActive: {
    backgroundColor: '#ECF1F7',
    borderColor: '#D9E4EE',
    borderWidth: 1,
  },
  pickChipText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 10,
    color: '#233E55',
    textAlign: 'center',
    lineHeight: 12,
    letterSpacing: 0,
  },
  dropdownContainer: {
    marginTop: 8,
    width: '100%',
  },
  customDropdownInput: {
    height: 36,
    borderColor: '#EFEFF0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    color: '#595A5C',
    width: '100%',
  },
  autoCompleteWrapper: {
    width: '100%',
  },
  autoCompleteInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoCompleteInput: {
    flex: 1,
    height: 36,
    borderColor: '#EFEFF0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontSize: 12,
    color: '#595A5C',
  },
  loadingBox: {
    height: 36,
    width: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFF0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    height: 36,
    width: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFF0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#233E55',
  },
  suggestionBox: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9E4EE',
    backgroundColor: '#FFFFFF',
    maxHeight: 220,
    overflow: 'hidden',
  },
  suggestionScroll: {
    maxHeight: 220,
  },
  suggestionRow: {
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D9E4EE',
  },
  suggestionText: {
    fontFamily: 'Mulish',
    fontWeight: '700',
    fontSize: 12,
    color: '#233E55',
    flex: 1,
    marginRight: 10,
  },
  helperText: {
    marginTop: 6,
    fontFamily: 'Mulish',
    fontWeight: '600',
    fontSize: 11,
    color: '#7A7A7A',
  },
});

export default FilterBar;
