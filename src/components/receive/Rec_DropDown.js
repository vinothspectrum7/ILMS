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
} from 'react-native';
import DropdownIcon from '../../assets/icons/dropdown.svg';
import SearchIcon from '../../assets/icons/search.svg';
import BarcodeScannerIcon from '../../assets/icons/barcodescanner.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

export default function Rec_DropDown({
  label,
  required = false,
  placeholder = 'Select',
  value,
  onChange,
  items = [],
  displayValue,
  renderCode,
  searchKeys = ['name', 'code', 'description'],
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

  const selectedLabel = useMemo(() => {
    if (!value) return '';
    if (displayValue) return displayValue(value);
    return value.name || value.code || '';
  }, [value, displayValue]);

  const filteredItems = useMemo(() => {
    const term = (search || '').toLowerCase().trim();
    if (!term) return items;
    return items.filter(it =>
      searchKeys.some(k => String(it[k] || '').toLowerCase().includes(term)),
    );
  }, [items, search, searchKeys]);

  const measureAnchor = () => {
    if (anchorRef.current && anchorRef.current.measureInWindow) {
      anchorRef.current.measureInWindow((x, y, width, height) => {
        if (width && height) {
          setAnchorLayout({ x, y, width, height });
        }
      });
    }
  };

  const openDropdown = () => {
    if (disabled) return;
    if (anchorRef.current && anchorRef.current.measureInWindow) {
      anchorRef.current.measureInWindow((x, y, width, height) => {
        if (width && height) {
          setAnchorLayout({ x, y, width, height });
        }
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
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

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

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

    if (top < marginTop) {
      top = marginTop;
    }

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
      <View style={styles.fieldWrapper}>
        {label ? (
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.required}>*</Text> : null}
          </Text>
        ) : null}

        <TouchableOpacity
          ref={anchorRef}
          collapsable={false}
          style={[styles.inputContainer, disabled && styles.disabledInput]}
          onPress={openDropdown}
          onLayout={measureAnchor}
          activeOpacity={0.8}
        >
          <Text
            numberOfLines={1}
            style={[styles.inputText, !selectedLabel && styles.placeholderText]}
          >
            {selectedLabel || placeholder}
          </Text>

          <View style={styles.rightIcons}>
            {showBarcodeIcon ? (
              <TouchableOpacity
                onPress={onBarcodePress}
                activeOpacity={0.85}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <BarcodeScannerIcon width={rs(18)} height={rs(18)} />
              </TouchableOpacity>
            ) : (
              <DropdownIcon width={rs(14)} height={rs(14)} style={styles.dropdownIcon} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={dropdownCardStyle}
          onLayout={event => {
            const h = event.nativeEvent.layout.height;
            if (h && h !== cardHeight) {
              setCardHeight(h);
            }
          }}
        >
          {/* <View style={styles.searchLabelRow}>
            <Text style={styles.searchLabel}>Search</Text>
          </View> */}

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

          <View style={styles.divider} />

          <FlatList
            style={styles.list}
            data={filteredItems}
            keyExtractor={(item, index) => String(item.id ?? index)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = value && value.id === item.id;
              const description = item.description ? String(item.description) : '';

              return (
                <TouchableOpacity
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {description ? (
                      <Text
                        style={styles.rowRightDesc}
                        numberOfLines={1}
                      >
                        {description}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.rowdivider} />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: rs(16),
  },
  label: {
    fontSize: rs(12),
    color: '#333333',
    marginBottom: rs(4),
  },
  required: {
    color: '#E53935',
  },
  inputContainer: {
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: rs(12),
    height: rs(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledInput: {
    backgroundColor: '#EFEFF0',
  },
  inputText: {
    fontSize: rs(14),
    color: '#222222',
    flex: 1,
  },
  placeholderText: {
    color: '#9E9E9E',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: rs(8),
  },
  dropdownIcon: {
    marginLeft: rs(6),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(12),
    paddingHorizontal: rs(16),
    paddingTop: rs(12),
    paddingBottom: rs(16),
    elevation: 2,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  searchLabelRow: {
    marginBottom: rs(4),
  },
  searchLabel: {
    fontSize: rs(12),
    color: '#777777',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rs(8),
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: rs(10),
    height: rs(40),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(14),
    color: '#222222',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: rs(10),
  },
  rowdivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: rs(5),
  },
  row: {
    paddingVertical: rs(5),
    paddingHorizontal: rs(4),
  },
  rowSelected: {
    backgroundColor: '#ECF1F7',
    borderRadius: rs(6),
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(2),
  },
  rowTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#222222',
    flex: 1,
    marginRight: rs(8),
  },
  rowRightDesc: {
    fontSize: rs(12),
    color: '#777777',
    maxWidth: '50%',
    textAlign: 'right',
  },
});
