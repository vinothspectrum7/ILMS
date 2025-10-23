import React, { useMemo, useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import SearchIcon from "../../assets/icons/search.svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BASE_WIDTH = 375;
const scale = (size) => Math.round((SCREEN_WIDTH / BASE_WIDTH) * size);
const ms = (size, factor = 0.35) => Math.round(size + (scale(size) - size) * factor);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const Inv_CustomDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
  enableSearch = true,
  searchPlaceholder = "Search..",
  maxMenuHeight = 220,
  width,
  selectedwidth,
  height = 44,
  compact = false,
  containerStyle = {},
  menuWidth,
  menuAlign = "left",
  menuOffsetX = 0,
  idKey = "id",
  nameKey = "name",
  enabledKey = null,
  defaultKey = "is_default",
  floatingFromPlaceholder = true,
  floatingBg = "#F6F8FA",
  autoSelectWhenEmpty = false
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const toggleOpen = () => {
    if (!disabled) setOpen((o) => !o);
  };

  const handleSelect = (opt) => {
    if (!disabled) {
      onChange?.(opt[idKey]);
      setOpen(false);
      setQuery("");
    }
  };

  const isEnabled = (o) => {
    if (!enabledKey) return true;
    if (!(enabledKey in o)) return true;
    return !!o[enabledKey];
  };

  useEffect(() => {
    if (autoSelectWhenEmpty && !value && options?.length > 0) {
      const def = options.find((o) => o[defaultKey] && isEnabled(o)) || options.find((o) => isEnabled(o));
      if (def) onChange?.(def[idKey]);
    }
  }, [autoSelectWhenEmpty, value, options, onChange, idKey, defaultKey]);

  const selectedItem = options.find((o) => o[idKey] === value);
  const display = selectedItem ? selectedItem[nameKey] : placeholder;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.filter(isEnabled);
    return options.filter((o) => isEnabled(o) && String(o[nameKey]).toLowerCase().includes(q));
  }, [options, query, nameKey]);

  const finalHeight = ms(typeof height === "number" ? height : 44);
  const fieldWidth = typeof selectedwidth === "number" ? selectedwidth : undefined;

  const desiredMenuW = typeof menuWidth === "number" ? menuWidth : ms(320);
  const safeMenuW = clamp(desiredMenuW, ms(220), SCREEN_WIDTH - ms(32));
  const menuStyleByAlign = menuAlign === "right" ? { right: 0, left: undefined } : { left: 0, right: undefined };
  const menuContainerStyle = { width: safeMenuW, ...menuStyleByAlign, transform: [{ translateX: menuOffsetX }] };
  const menuMaxHeight = Math.min(ms(maxMenuHeight), Math.round(SCREEN_HEIGHT * 0.5));

  const showFloating = floatingFromPlaceholder && !label && !!value;

  return (
    <View style={[styles.wrap, { zIndex: open ? 20 : 1 }, compact && styles.wrapCompact, disabled && styles.wrapDisabled, containerStyle]}>
      {!!label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={1}>{label}</Text>
        </View>
      )}

      {showFloating && (
        <View style={[styles.floatingLabelWrap, { backgroundColor: floatingBg }]}>
          <Text style={styles.floatingLabelText} numberOfLines={1}>{placeholder}</Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleOpen}
        disabled={disabled}
        style={[styles.input, disabled && styles.inputDisabled, { height: finalHeight, width: fieldWidth }]}
        ref={inputRef}
      >
        <Text
          style={[styles.valueText, !value && styles.placeholder, disabled && styles.valueDisabled]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {display}
        </Text>
        {open ? (
          <ChevronUp size={ms(18)} color={disabled ? "#8C99A6" : "#233E55"} />
        ) : (
          <ChevronDown size={ms(18)} color={disabled ? "#8C99A6" : "#233E55"} />
        )}
      </TouchableOpacity>

      {open && !disabled && (
        <View style={[styles.menuContainer, menuContainerStyle]} pointerEvents="box-none">
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
              {filtered.length === 0 ? (
                <View style={styles.noDataRow}>
                  <Text style={styles.noDataText}>No data found</Text>
                </View>
              ) : (
                filtered.map((opt) => {
                  const selected = opt[idKey] === value;
                  return (
                    <TouchableOpacity
                      key={opt[idKey]}
                      style={[styles.menuItem, selected && styles.menuItemSelected]}
                      onPress={() => handleSelect(opt)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.menuText, selected && styles.menuTextSelected]} numberOfLines={1}>
                        {opt[nameKey]}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {disabled && <View style={StyleSheet.absoluteFill} pointerEvents="auto" />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginHorizontal: ms(16), marginTop: ms(10), position: "relative" },
  wrapCompact: { marginHorizontal: 0, marginTop: 0 },
  wrapDisabled: {},
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: ms(6) },
  label: { fontSize: ms(12), color: "#233E55" },
  labelDisabled: { color: "#9CA3AF" },
  floatingLabelWrap: {
    position: "absolute",
    left: ms(24),
    top: -ms(8),
    paddingHorizontal: ms(6),
    zIndex: 21,
    borderRadius: ms(4)
  },
  floatingLabelText: { fontSize: ms(11), color: "#6B7280" },
  input: {
    paddingHorizontal: ms(14),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#00000040",
    borderRadius: ms(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  inputDisabled: { backgroundColor: "#9D9FA3", borderColor: "#FFFFFF" },
  valueText: { fontSize: ms(14), color: "#233E55", flex: 1, paddingRight: ms(6) },
  valueDisabled: { color: "#233E55" },
  placeholder: { color: "#A9B4BF" },
  menuContainer: { position: "absolute", top: "100%", zIndex: 10 },
  menu: {
    borderRadius: ms(5),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: ms(8),
    shadowOffset: { width: 0, height: ms(4) },
    elevation: 3
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: ms(12),
    height: ms(40)
  },
  searchInput: { color: "#111827", paddingVertical: 0, paddingRight: ms(8), flex: 1, fontSize: ms(14) },
  menuItem: { paddingVertical: ms(12), paddingHorizontal: ms(16) },
  menuItemSelected: { backgroundColor: "#E7F0FA" },
  menuText: { fontSize: ms(14), color: "#111827" },
  menuTextSelected: { fontWeight: "700" },
  noDataRow: { paddingVertical: ms(12), paddingHorizontal: ms(12), alignItems: "center", justifyContent: "center" },
  noDataText: { fontSize: ms(14), color: "#9CA3AF" }
});

export default Inv_CustomDropdown;
