import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import SearchIcon from '../assets/icons/search.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
const ms = (size, factor = 0.35) => Math.round(size + (scale(size) - size) * factor);

const PencilDropdownRow = ({
  label,
  value,               // <- will hold sub_inv_id
  onChange,             // <- will return sub_inv_id
  options = [],         // <- API array of objects
  placeholder = 'Select',
  disabled = false,
  enableSearch = true,
  searchPlaceholder = 'Search..',
  maxMenuHeight = 220,
  width,
  height = 44,
  compact = false,
  containerStyle = {},
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const toggleOpen = () => { if (!disabled) setOpen(o => !o); };
  const handleSelect = (v) => {
    if (!disabled) {
      onChange?.(v.sub_inv_id);   // store ID
      setOpen(false);
      setQuery('');
    }
  };

  // 👉 Auto-select default if no value provided
  useEffect(() => {
    if (!value && options.length > 0) {
      const def = options.find(o => o.is_default && o.sub_inv_enabled);
      if (def) {
        onChange?.(def.sub_inv_id);
      }
    }
  }, [value, options, onChange]);

  // find display name for current value
  const selectedItem = options.find(o => o.sub_inv_id === value);
  const display = selectedItem ? selectedItem.sub_inv_name : placeholder;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.filter(o => o.sub_inv_enabled); // only enabled
    return options.filter(o =>
      o.sub_inv_enabled &&
      o.sub_inv_name.toLowerCase().includes(q)
    );
  }, [options, query]);

  const finalHeight = ms(typeof height === 'number' ? height : 44);
  const finalWidth = typeof width === 'number' ? ms(width) : width;
  const menuMaxHeight = Math.min(
    typeof maxMenuHeight === 'number' ? ms(maxMenuHeight) : ms(220),
    Math.round(SCREEN_HEIGHT * 0.5)
  );

  return (
    <View style={[
      styles.wrap,
      { zIndex: open ? 10 : 1 },
      compact && styles.wrapCompact,
      disabled && styles.wrapDisabled,
      containerStyle
    ]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleOpen}
        disabled={disabled}
        style={[
          styles.input,
          { height: finalHeight, width: finalWidth }
        ]}
        ref={inputRef}
      >
        <Text
          style={[styles.valueText, !value && styles.placeholder, disabled && styles.valueDisabled]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {display}
        </Text>
        {open ? <ChevronUp size={ms(20)} color="#000000" /> : <ChevronDown size={ms(20)} color="#000000" />}
      </TouchableOpacity>

      {open && !disabled && (
        <View style={styles.menuContainer} pointerEvents="box-none">
          <View style={[styles.menu, { maxHeight: menuMaxHeight }]}>
            {enableSearch && (
              <View style={styles.searchRow}>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <SearchIcon width={ms(16)} height={ms(16)} />
              </View>
            )}
            <ScrollView keyboardShouldPersistTaps="handled">
              {filtered.map((opt) => {
                const selected = opt.sub_inv_id === value;
                return (
                  <TouchableOpacity
                    key={opt.sub_inv_id}
                    style={[styles.menuItem, selected && styles.menuItemSelected]}
                    onPress={() => handleSelect(opt)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.menuText, selected && styles.menuTextSelected]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {opt.sub_inv_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {disabled && <View style={StyleSheet.absoluteFill} pointerEvents="auto" />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginHorizontal: ms(16), marginTop: ms(10), position: 'relative' },
  wrapCompact: { marginHorizontal: 0, marginTop: 0 },
  wrapDisabled: { opacity: 0.6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: ms(6) },
  label: { fontSize: ms(12), color: '#233E55' },
  labelDisabled: { color: '#9CA3AF' },
  input: {
    paddingHorizontal: ms(12),
    backgroundColor: '#5D768B0D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: ms(8),
  },
  valueText: { fontSize: ms(10), color: '#111827', flex: 1, paddingRight: ms(8) },
  valueDisabled: { color: '#233E55' },
  placeholder: { color: '#9CA3AF' },
  menuContainer: {
    position: 'absolute',
    top: '100%',
    left: -(SCREEN_WIDTH * 0.7),
    right: -(SCREEN_WIDTH * 0.02),
    zIndex: 10,
    marginTop: ms(6),
  },
  menu: {
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: ms(8),
    shadowOffset: { width: 0, height: ms(4) },
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: ms(12),
    height: ms(40),
  },
  searchInput: { color: '#111827', paddingVertical: 0, paddingRight: ms(8), flex: 1, fontSize: ms(14) },
  menuItem: { paddingVertical: ms(10), paddingHorizontal: ms(12) },
  menuItemSelected: { backgroundColor: '#5D768B33' },
  menuText: { fontSize: ms(14), color: '#111827' },
  menuTextSelected: { fontWeight: '700' },
});

export default PencilDropdownRow;
