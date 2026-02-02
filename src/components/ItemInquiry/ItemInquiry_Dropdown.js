import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Image,
} from 'react-native';
import DropdownIcon from '../../assets/icons/dropdown.svg';
import SearchIcon from '../../assets/icons/search.svg';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';
import OrgbuildingIcon from '../../assets/icons/CycleCount_Icons/OrgbuildingIcon.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

export default function ItemInquiry_Dropdown({
  label = 'Organization',
  required = false,
  placeholder = 'Select',
  value,
  onChange,
  items = [],
  displayValue,
  searchKeys = ['name', 'code', 'description', 'organization'],
  disabled = false,
  showBarcodeIcon = false,
  onBarcodePress,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [anchorLayout, setAnchorLayout] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const anchorRef = useRef(null);

  const selectedItem = useMemo(() => {
    if (!value) return null;
    return value;
  }, [value]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    const term = (search || '').toLowerCase().trim();
    if (!term) return items;
    return items.filter(it =>
      searchKeys.some(k => String(it[k] || '').toLowerCase().includes(term)),
    );
  }, [items, search, searchKeys]);

  // Top fixed item
  const topItem = { organization: 'Organization', orgIcon: null };

  // Remove top item from the scrollable list to avoid duplicate
  const scrollableItems = filteredItems.filter(
    it => (it.organization || it.name) !== topItem.organization
  );

  const measureAnchor = () => {
    if (anchorRef.current && anchorRef.current.measureInWindow) {
      anchorRef.current.measureInWindow((x, y, width, height) => {
        if (width && height) setAnchorLayout({ x, y, width, height });
      });
    }
  };

  const openDropdown = () => {
    if (disabled) return;
    measureAnchor();
    setOpen(true);
  };

  const handleSelect = item => {
    onChange?.(item);
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!open) {
      setKeyboardHeight(0);
      return;
    }

    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      const h = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(h);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [open]);

  const computedTop = useMemo(() => {
    if (!anchorLayout) return undefined;
    const marginTop = rs(8);
    const marginBottom = rs(8);
    let top = anchorLayout.y + anchorLayout.height;

    if (keyboardHeight > 0 && cardHeight > 0) {
      const maxTop = SCREEN_HEIGHT - keyboardHeight - cardHeight - marginBottom;
      top = Math.min(top, maxTop);
    }
    if (top < marginTop) top = marginTop;
    return top;
  }, [anchorLayout, keyboardHeight, cardHeight]);

  const dropdownCardStyle = [
    styles.cardContainer,
    anchorLayout && {
      position: 'absolute',
      left: anchorLayout.x,
      width: anchorLayout.width,
      top: computedTop,
    },
  ];

  return (
    <>
      {/* Main dropdown field */}
      <TouchableOpacity
        ref={anchorRef}
        style={[styles.inputContainer, disabled && styles.disabledInput]}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        {/* {selectedItem?.orgIcon && ( */}
        <View style={styles.iconInsideContainer}>
          <OrgbuildingIcon width={rs(24)} height={rs(24)} />
        </View>
        {/* )} */}
        <View style={styles.selectedTextWrapper}>
          <Text style={styles.selectedLabel}>{label}</Text>
          <Text style={styles.selectedValue}>
            {selectedItem?.organization || selectedItem?.name || placeholder}
          </Text>
        </View>
        <DropdownIcon width={rs(30)} height={rs(30)} />
      </TouchableOpacity>

      {/* Modal dropdown */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={dropdownCardStyle}
          onLayout={event => {
            const h = event.nativeEvent.layout.height;
            if (h && h !== cardHeight) setCardHeight(h);
          }}
        >
          {/* Search input */}
          <View style={styles.searchInputWrapper}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search"
              style={styles.searchInput}
              autoFocus
            />
            <SearchIcon width={rs(18)} height={rs(18)} />
          </View>

          {/* Fixed top item */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => handleSelect(topItem)}
            activeOpacity={0.8}
          >
            {topItem.orgIcon && <Image source={{ uri: topItem.orgIcon }} style={styles.rowIcon} />}
            <View style={styles.rowTextWrapper}>
              {/* <Text style={styles.rowLabel}>{label}</Text> */}
              <Text style={styles.rowValue}>{topItem.organization}</Text>
            </View>
          </TouchableOpacity>

          {/* Scrollable items */}
          <FlatList
            data={scrollableItems}
            keyExtractor={(item, index) => String(item.id ?? index)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleSelect(item)}
                activeOpacity={0.8}
              >
                {item.orgIcon && <Image source={{ uri: item.orgIcon }} style={styles.rowIcon} />}
                <View style={styles.rowTextWrapper}>
                  {/* <Text style={styles.rowLabel}>{label}</Text> */}
                  <Text style={styles.rowValue}>{item.organization || item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#F7F9FC',
    // borderRadius: rs(8),
    paddingHorizontal: rs(0),
    paddingVertical: rs(2),
    // borderWidth: 1,
    // borderColor: '#E0E0E0',
  },
  disabledInput: {
    backgroundColor: '#EFEFF0',
  },
  selectedIcon: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(4),
    marginRight: rs(10),
  },
    iconInsideContainer: {
    marginRight: rs(10),
  },
  selectedTextWrapper: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: rs(11),
    color: '#595A5C',
    marginBottom:5
  },
  selectedValue: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#222222',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    paddingVertical: rs(8),
    paddingHorizontal: rs(12),
    elevation: 3,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: rs(10),
    height: rs(40),
    marginBottom: rs(8),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(14),
    color: '#222222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rs(10),
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  rowIcon: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(4),
    marginRight: rs(10),
  },
  rowTextWrapper: {
    flex: 1,
  },
  rowLabel: {
    fontSize: rs(10),
    color: '#777777',
  },
  rowValue: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#222222',
  },
});
