import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import SearchIcon from '../assets/icons/search.svg';

const PencilDropdownRow = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select',
  LeftIcon,
  disabled = false,
  zIndex = 0,
  enableSearch = true,
  searchPlaceholder = 'Search..',
  maxMenuHeight = 220,
  width,
  height = 44,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggleOpen = () => { if (!disabled) setOpen(o => !o); };
  const handleSelect = (v) => { if (!disabled) { onChange?.(v); setOpen(false); setQuery(''); } };

  const display = value ? String(value) : placeholder;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(opt => String(opt).toLowerCase().includes(q));
  }, [options, query]);

  return (
    <View style={[styles.wrap, { zIndex }, compact && styles.wrapCompact, disabled && styles.wrapDisabled]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleOpen}
        disabled={disabled}
        style={[styles.input, { height, width }, disabled && styles.inputDisabled]}
      >
        <Text style={[styles.valueText, !value && styles.placeholder, disabled && styles.valueDisabled]}>
          {display}
        </Text>
        {LeftIcon ? <LeftIcon width={14} height={14} /> : null}
      </TouchableOpacity>

      {open && !disabled && (
        <View style={[styles.menu, { maxHeight: maxMenuHeight }]}>
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
              <SearchIcon width={16} height={16} />
            </View>
          )}
          <ScrollView keyboardShouldPersistTaps="handled">
            {filtered.map((opt, idx) => {
              const selected = String(opt) === String(value);
              return (
                <TouchableOpacity
                  key={String(opt ?? idx)}
                  style={[styles.menuItem, selected && styles.menuItemSelected]}
                  onPress={() => handleSelect(opt)}
                >
                  <Text style={[styles.menuText, selected && styles.menuTextSelected]}>
                    {String(opt)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {disabled && <View style={StyleSheet.absoluteFill} pointerEvents="auto" />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 10 },
  wrapCompact: { marginHorizontal: 0, marginTop: 0 },
  wrapDisabled: { opacity: 0.6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 12, color: '#233E55' },
  labelDisabled: { color: '#9CA3AF' },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    paddingHorizontal: 12,
    backgroundColor: '#5D768B0D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputDisabled: { backgroundColor: '#F5F6F7' },
  valueText: { fontSize: 14, color: '#111827' },
  valueDisabled: { color: '#233E55' },
  placeholder: { color: '#9CA3AF' },
  menu: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, color: '#111827', paddingVertical: 0, paddingRight: 8 },
  menuItem: { paddingVertical: 10, paddingHorizontal: 12 },
  menuItemSelected: { backgroundColor: '#F2F4F5' },
  menuText: { fontSize: 14, color: '#111827' },
  menuTextSelected: { fontWeight: '700' },
});

export default PencilDropdownRow;
