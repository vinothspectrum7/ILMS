import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { TextInput } from 'react-native';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

const BRAND_BG = '#233E55';
const WHITE = '#FFFFFF';

const getItemId = it => {
  if (!it) return '';
  if (typeof it === 'string' || typeof it === 'number') return String(it);
  if (typeof it === 'object') return String(it.id ?? it.locator_id ?? it.value ?? '');
  return '';
};

export default function Header_DropDown({
  label,
  required = false,
  placeholder = 'Select Org',
  value,
  onChange,
  items = [],
  displayValue,
  renderDropdownIcon,
  disabled = false,
  containerStyle,
}) {
  const [open, setOpen] = useState(false);
  const [anchorLayout, setAnchorLayout] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const anchorRef = useRef(null);
  const [searchText, setSearchText] = useState('');

  const resolvedSelectedItem = useMemo(() => {
    if (!value || items.length === 0) return null;

    const valueId = typeof value === 'object' ? getItemId(value) : String(value);

    return items.find(it => String(getItemId(it)) === String(valueId)) || null;
  }, [value, items]);

  useEffect(() => {
  if (!open) setSearchText('');
   }, [open]);

  const filteredItems = useMemo(() => {
  if (!searchText.trim()) return items;

  const q = searchText.toLowerCase();

  return items.filter(it => {
    const label =
      it?.label ??
      it?.name ??
      it?.org_code ??
      '';

    return String(label).toLowerCase().includes(q);
  });
}, [items, searchText]);


  const selectedLabel = useMemo(() => {
    if (!value) return '';
    
    if (displayValue) {
      const input = resolvedSelectedItem ?? value;
      return String(displayValue(input) ?? '');
    }

    if (typeof value === 'object') {
      return value?.label ?? value?.name ?? value?.org_code ?? '';
    }

    return resolvedSelectedItem?.label ?? resolvedSelectedItem?.name ?? resolvedSelectedItem?.org_code ?? '';
  }, [value, displayValue, resolvedSelectedItem]);

  const measureAnchor = () => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      if (width && height) setAnchorLayout({ x, y, width, height });
    });
  };

  const openDropdown = () => {
    if (disabled) return;
    measureAnchor();
    setOpen(true);
  };

  const handleSelect = item => {
    onChange?.(item);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const show = Keyboard.addListener('keyboardDidShow', e =>
      setKeyboardHeight(e?.endCoordinates?.height ?? 0),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [open]);

  const computedTop = useMemo(() => {
    if (!anchorLayout) return undefined;
    let top = anchorLayout.y + anchorLayout.height;
    const maxTop = SCREEN_HEIGHT - keyboardHeight - cardHeight - rs(8);
    return Math.min(top, maxTop);
  }, [anchorLayout, keyboardHeight, cardHeight]);

  const dropdownCardStyle = [
    styles.cardContainer,
    anchorLayout && {
      position: 'absolute',
      left: anchorLayout.x,
      width: anchorLayout.width,
      top: computedTop,
      maxHeight: SCREEN_HEIGHT * 0.2,
    },
  ];

  const selectedId = useMemo(() => {
    if (!value) return '';
    if (typeof value === 'object') return getItemId(value);
    return String(value);
  }, [value]);

  return (
    <>
      <View style={[styles.fieldWrapper, containerStyle]}>
        {label ? (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        ) : null}

        <TouchableOpacity
          ref={anchorRef}
          collapsable={false}
          style={[styles.inputContainer, disabled && styles.disabledInput]}
          onPress={openDropdown}
          onLayout={measureAnchor}
          activeOpacity={0.85}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.inputText,
              !selectedLabel && styles.placeholderText,
            ]}
          >
            {selectedLabel || placeholder}
          </Text>

          {renderDropdownIcon ? (
            renderDropdownIcon(open)
          ) : (
            <Text style={styles.dropdownIcon}>
              {open ? '▲' : '▼'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={dropdownCardStyle}
          onLayout={e => setCardHeight(e.nativeEvent.layout.height)}
        >
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search org..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={styles.searchInput}
          autoFocus
        />

          <FlatList
            data={filteredItems}
            keyExtractor={(item, index) => String(getItemId(item) || index)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const itemId = String(getItemId(item));
              const isSelected = itemId === String(selectedId);

              return (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {displayValue 
                        ? String(displayValue(item) ?? '') 
                        : item?.label ?? item?.name ?? item?.org_code ?? ''
                      }
                    </Text>

                    {isSelected && (
                      <Text style={styles.tick}>✓</Text>
                    )}
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
    marginBottom: 0,
  },
  label: { 
    fontSize: rs(12), 
    color: '#333', 
    marginBottom: rs(4) 
  },
  required: { 
    color: '#E53935' 
  },
  inputContainer: {
    height: rs(24),
    backgroundColor: BRAND_BG,
    paddingHorizontal: rs(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledInput: { 
    opacity: 0.6 
  },
  inputText: {
    fontSize: rs(14),
    color: WHITE,
    fontWeight: '600',
    flex: 1,
  },
  placeholderText: {
    color: WHITE,
    opacity: 0.7,
  },
  dropdownIcon: {
    color: WHITE,
    fontSize: rs(10),
     marginLeft: rs(0), 
    marginRight: rs(4), 
  },
  backdrop: { 
    ...StyleSheet.absoluteFillObject 
  },
  cardContainer: {
    backgroundColor: BRAND_BG,
    borderRadius: rs(4),
    paddingHorizontal: rs(8),
    paddingVertical: rs(6),
    elevation: 3,
  },
  row: { 
    paddingVertical: rs(6) 
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: {
    fontSize: rs(14),
    color: WHITE,
    fontWeight: '500',
    flex: 1,
    marginRight: rs(8),
  },
  tick: {
    fontSize: rs(16),
    color: WHITE,
    fontWeight: '700',
  },
  rowdivider: {
    height: 1,
    backgroundColor: WHITE,
    opacity: 0.3,
    marginTop: rs(6),
  },
  searchInput: {
  height: rs(35),
  borderRadius: rs(4),
  // backgroundColor: '#1B3347',
  // paddingHorizontal: rs(12),
  color: WHITE,
  fontSize: rs(14),
  marginBottom: rs(6),
  borderBottomWidth:1,
  marginTop:2,
  borderColor:WHITE
  // textAlign:'center',
  // paddingTop:5
},

});