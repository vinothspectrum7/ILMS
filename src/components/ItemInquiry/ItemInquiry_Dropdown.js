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
import CloseIcon from '../../assets/icons/close.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const getItemId = it => {
  if (!it) return '';
  if (typeof it === 'string' || typeof it === 'number') return String(it);
  if (typeof it === 'object') return String(it.id ?? it.locator_id ?? it.value ?? '');
  return '';
};

const isPrimitive = v => typeof v === 'string' || typeof v === 'number';

const SelectedChip = ({ item, onRemove, displayValue }) => {
  const label = displayValue ? displayValue(item) : (item?.name || item?.code || '');

  return (
    <View style={styles.chipContainer}>
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={() => onRemove(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.chipCloseButton}
      >
        <CloseIcon width={rs(12)} height={rs(12)} />
      </TouchableOpacity>
    </View>
  );
};

export default function ItemInquiry_Dropdown({
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
  multiple = false,
  maxDisplayItems = 3,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [anchorLayout, setAnchorLayout] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const anchorRef = useRef(null);

  const resolvedSelectedItems = useMemo(() => {
    if (!value) return [];
    
    if (multiple) {
      return Array.isArray(value) ? value : [];
    } else {
      if (!value) return [];
      if (typeof value === 'object') return [value];
      if (isPrimitive(value)) {
        const vid = String(value);
        const found = (Array.isArray(items) ? items : []).find(it => String(getItemId(it)) === vid);
        return found ? [found] : [];
      }
      return [];
    }
  }, [value, items, multiple]);

  const { displayedChips, remainingCount } = useMemo(() => {
    if (!multiple || resolvedSelectedItems.length === 0) {
      return { displayedChips: resolvedSelectedItems, remainingCount: 0 };
    }
    
    const displayed = resolvedSelectedItems.slice(0, maxDisplayItems);
    const remaining = Math.max(0, resolvedSelectedItems.length - maxDisplayItems);
    
    return { displayedChips: displayed, remainingCount: remaining };
  }, [resolvedSelectedItems, multiple, maxDisplayItems]);

  const selectedLabel = useMemo(() => {
    if (multiple && resolvedSelectedItems.length > 0) {
      return '';
    }
    
    if (!multiple && resolvedSelectedItems.length > 0) {
      const item = resolvedSelectedItems[0];
      if (displayValue) {
        const out = displayValue(item);
        return out == null ? '' : String(out);
      }
      return String(item?.name ?? item?.code ?? '');
    }
    
    return '';
  }, [multiple, resolvedSelectedItems, displayValue]);

  const filteredItems = useMemo(() => {
    const term = (search || '').toLowerCase().trim();
    if (!term) return items;

    return (Array.isArray(items) ? items : []).filter(it =>
      (Array.isArray(searchKeys) ? searchKeys : ['name']).some(k =>
        String(it?.[k] ?? '').toLowerCase().includes(term),
      ),
    );
  }, [items, search, searchKeys]);

  const measureAnchor = () => {
    if (anchorRef.current && anchorRef.current.measureInWindow) {
      anchorRef.current.measureInWindow((x, y, width, height) => {
        if (width && height) setAnchorLayout({ x, y, width, height });
      });
    }
  };

  const openDropdown = () => {
    if (disabled) return;

    if (anchorRef.current && anchorRef.current.measureInWindow) {
      anchorRef.current.measureInWindow((x, y, width, height) => {
        if (width && height) setAnchorLayout({ x, y, width, height });
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  };

  const handleSelect = item => {
    if (!multiple) {
      onChange?.(item);
      setOpen(false);
      setSearch('');
      return;
    }

    const exists = Array.isArray(value)
      ? value.some(v => String(getItemId(v)) === String(getItemId(item)))
      : false;

    let updated;

    if (exists) {
      updated = (value || []).filter(
        v => String(getItemId(v)) !== String(getItemId(item)),
      );
    } else {
      updated = [...(value || []), item];
    }

    onChange?.(updated);
  };

  const handleRemoveChip = (itemToRemove) => {
    if (!multiple || !Array.isArray(value)) return;
    
    const updated = value.filter(
      v => String(getItemId(v)) !== String(getItemId(itemToRemove)),
    );
    onChange?.(updated);
  };

  const selectedIds = useMemo(() => {
    if (!multiple) {
      return resolvedSelectedItems.map(item => String(getItemId(item)));
    }
    return Array.isArray(value)
      ? value.map(v => String(getItemId(v)))
      : [];
  }, [value, multiple, resolvedSelectedItems]);

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

    if (top < marginTop) top = marginTop;

    return top;
  }, [anchorLayout, keyboardHeight, cardHeight]);

  // Custom dropdown width based on your requirements
  const dropdownWidth = rs(300); // Width from your specs
  const dropdownLeft = anchorLayout ? anchorLayout.x : 0;

  const dropdownCardStyle = [
    styles.cardContainer,
    {
      width: dropdownWidth,
    },
    anchorLayout && {
      position: 'absolute',
      left: dropdownLeft,
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
          style={[
            styles.inputContainer, 
            disabled && styles.disabledInput,
            multiple && resolvedSelectedItems.length > 0 && styles.multipleInputContainer
          ]}
          onPress={openDropdown}
          onLayout={measureAnchor}
          activeOpacity={0.8}
        >
          <View style={styles.inputContent}>
            {multiple ? (
              <View style={styles.chipsContainer}>
                {displayedChips.map((item, index) => (
                  <SelectedChip
                    key={String(getItemId(item) || index)}
                    item={item}
                    onRemove={handleRemoveChip}
                    displayValue={displayValue}
                  />
                ))}
                {remainingCount > 0 && (
                  <View style={styles.moreChip}>
                    <Text style={styles.moreText}>more</Text>
                  </View>
                )}
                {resolvedSelectedItems.length === 0 && (
                  <Text style={[styles.inputText, styles.placeholderText]}>
                    {placeholder}
                  </Text>
                )}
              </View>
            ) : (
              <Text 
                numberOfLines={1} 
                style={[
                  styles.inputText, 
                  !selectedLabel && styles.placeholderText
                ]}
              >
                {selectedLabel || placeholder}
              </Text>
            )}
          </View>

          <View style={styles.rightIcons}>
            {showBarcodeIcon ? (
              <TouchableOpacity
                onPress={onBarcodePress}
                activeOpacity={0.85}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <BarcodeScannerIcon width={rs(24)} height={rs(24)} />
              </TouchableOpacity>
            ) : (
              <DropdownIcon width={rs(24)} height={rs(24)} style={styles.dropdownIcon} />
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
            if (h && h !== cardHeight) setCardHeight(h);
          }}
        >
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
            keyExtractor={(item, index) => String(getItemId(item) || index)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const itemId = String(getItemId(item));
              const isSelected = selectedIds.includes(itemId);
              const description = item?.description ? String(item.description) : '';
              const rightText = renderCode ? String(renderCode(item) ?? '') : description;

              return (
                <TouchableOpacity
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {multiple && (
                      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    )}
                    
                    <View style={{ flex: 1 }}>
                      <View style={styles.rowHeader}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {String(item?.name ?? item?.code ?? '')}
                        </Text>

                        {rightText ? (
                          <Text style={styles.rowRightDesc} numberOfLines={1}>
                            {rightText}
                          </Text>
                        ) : null}
                      </View>
                    </View>
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
    marginBottom: 0, // Remove bottom margin for your layout
  },
  label: {
    fontSize: rs(8),
    color: '#595A5C',
    marginBottom: rs(4),
    fontFamily: 'Mulish',
    fontWeight: '400',
  },
  required: {
    color: '#E53935',
  },
  inputContainer: {
    borderRadius: rs(4),
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    height: rs(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: rs(20),
    width: '100%',
  },
  multipleInputContainer: {
    minHeight: rs(48),
    height: 'auto',
    paddingVertical: rs(8),
  },
  disabledInput: {
    backgroundColor: '#EFEFF0',
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: rs(6),
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECF1F7',
    borderRadius: rs(4),
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    marginRight: rs(4),
    minWidth: rs(73),
    height: rs(25),
    justifyContent: 'space-between',
  },
  chipText: {
    fontSize: rs(12),
    color: '#233E55',
    fontWeight: '500',
    marginRight: rs(4),
    maxWidth: rs(100),
  },
  chipCloseButton: {
    padding: rs(2),
  },
  moreChip: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    minWidth: rs(73),
    height: rs(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: rs(11),
    color: '#033EFF',
    fontFamily: 'Mulish',
    fontWeight: '400',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#033EFF',
    lineHeight: rs(11),
  },
  inputText: {
    fontSize: rs(10),
    color: '#242424',
    flex: 1,
    fontWeight: '700',
    fontFamily: 'Mulish',
  },
  placeholderText: {
    color: '#9D9FA3',
    fontWeight: '400',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(4),
    borderWidth: 1,
    borderColor: '#ECF1F7',
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.35,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rs(4),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: rs(10),
    height: rs(32),
    marginBottom: rs(8),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(12),
    color: '#222222',
    fontFamily: 'Mulish',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: rs(8),
  },
  rowdivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: rs(8),
    marginBottom: rs(8),
  },
  row: {
    paddingVertical: rs(8),
    paddingHorizontal: rs(4),
  },
  rowSelected: {
    backgroundColor: '#F3F8FF',
    borderRadius: rs(4),
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(2),
  },
  rowTitle: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#222222',
    flex: 1,
    marginRight: rs(8),
    fontFamily: 'Mulish',
  },
  rowRightDesc: {
    fontSize: rs(10),
    color: '#595A5C',
    maxWidth: '50%',
    textAlign: 'right',
    fontFamily: 'Mulish',
  },
  checkbox: {
    width: rs(18),
    height: rs(18),
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderRadius: rs(4),
    marginRight: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#233E55',
    borderColor: '#233E55',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: rs(12),
    fontWeight: '700',
  },
});