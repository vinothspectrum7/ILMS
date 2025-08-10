import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView
} from 'react-native';

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
  searchPlaceholder = 'Type something...',
  maxMenuHeight = 220,
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
    <View style={[styles.wrap, { zIndex }, disabled && styles.wrapDisabled]}>
      <View style={styles.labelRow}>
        {LeftIcon ? <LeftIcon width={14} height={14} style={{ marginRight: 6 }} /> : null}
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleOpen}
        disabled={disabled}
        style={[styles.input, disabled && styles.inputDisabled]}
      >
        <Text style={[styles.valueText, !value && styles.placeholder, disabled && styles.valueDisabled]}>
          {display}
        </Text>
        <Text style={[styles.chev, disabled && styles.valueDisabled]}>⌄</Text>
      </TouchableOpacity>

      {open && !disabled && (
        <View style={[styles.menu, { maxHeight: maxMenuHeight }]}>
          {enableSearch && (
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor="#233E55"
              style={styles.search}
              autoCapitalize="none"
              autoCorrect={false}
              borderColor="#233E55"
            />
          )}
          <ScrollView keyboardShouldPersistTaps="handled">
            {filtered.map((opt, idx) => {
              const selected = String(opt) === String(value);
              return (
                <TouchableOpacity key={String(opt ?? idx)} style={styles.menuItem} onPress={() => handleSelect(opt)}>
                  <Text style={[styles.menuText, selected && styles.menuTextSelected]}>{String(opt)}</Text>
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
  wrapDisabled: { opacity: 0.6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 12, color: '#233E55' },
  labelDisabled: { color: '#9CA3AF' },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#9CA3AF',
    paddingHorizontal: 12, backgroundColor: '#fff', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  inputDisabled: { backgroundColor: '#F5F6F7' },
  valueText: { fontSize: 14, color: '#111827' },
  valueDisabled: { color: '#233E55' },
  placeholder: { color: '#9CA3AF' },
  chev: { fontSize: 16, color: '#6B7280' },
  menu: {
    marginTop: 6, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#fff', overflow: 'hidden',
  },
  search: {
    height: 40, paddingHorizontal: 12, borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', color: '#111827',
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 12 },
  menuText: { fontSize: 14, color: '#111827' },
  menuTextSelected: { fontWeight: '700' },
});

export default PencilDropdownRow;
