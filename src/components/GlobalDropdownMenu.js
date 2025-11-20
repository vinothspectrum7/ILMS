import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions } from 'react-native';
import SearchIcon from '../assets/icons/search.svg';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const GlobalDropdownMenu = ({
  visible,
  position,
  options,
  value,
  onChange,
  onClose,
  enableSearch,
  searchPlaceholder,
  maxMenuHeight
}) => {
  const [query, setQuery] = useState('');

  const handleSelect = (v) => {
    onChange?.(v);
    onClose();
    setQuery('');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(opt => String(opt).toLowerCase().includes(q));
  }, [options, query]);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.menu,
            {
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: maxMenuHeight,
            },
          ]}
        >
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
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { color: '#111827', paddingVertical: 0, paddingRight: 8, flex: 1 },
  menuItem: { paddingVertical: 10, paddingHorizontal: 12 },
  menuItemSelected: { backgroundColor: '#F2F4F5' },
  menuText: { fontSize: 14, color: '#111827' },
  menuTextSelected: { fontWeight: '700' },
});

export default GlobalDropdownMenu;