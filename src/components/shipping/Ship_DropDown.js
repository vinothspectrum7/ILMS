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
import DropdownIcon from '../../assets/icons/Ship_Icons/DropdownIcon.svg';
import SearchIcon from '../../assets/icons/Ship_Icons/SearchIcon.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const rs = v => (SCREEN_WIDTH / BASE_WIDTH) * v;

export default function Ship_DropDown({
    label,
    required = false,
    placeholder = 'Select',
    value,
    onChange,
    items = [],
    displayValue,
    searchKeys = ['name', 'code', 'label'],
    disabled = false,
    showSearch = true,
    dropdownPosition = 'below',
    maxHeight = 200,
    inputStyle,
    containerStyle,
    error = false,
    errorMessage = '',
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
        return value.name || value.label || value.code || '';
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

        if (dropdownPosition === 'above' && cardHeight > 0) {
            const top = anchorLayout.y - cardHeight - marginBottom;
            return Math.max(top, marginTop);
        }

        let top = anchorLayout.y + anchorLayout.height + marginTop;

        if (keyboardHeight > 0 && cardHeight > 0) {
            const maxTop = SCREEN_HEIGHT - keyboardHeight - cardHeight - marginBottom;
            top = Math.min(top, maxTop);
        }

        if (top < marginTop) {
            top = marginTop;
        }

        return top;
    }, [anchorLayout, keyboardHeight, cardHeight, dropdownPosition]);

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
            <View style={[styles.fieldWrapper, containerStyle]}>
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
                        error && styles.inputError,
                        inputStyle,
                    ]}
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

                    <DropdownIcon width={rs(14)} height={rs(14)} />
                </TouchableOpacity>

                {error && errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
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
                    {showSearch && (
                        <>
                            <View style={styles.searchInputWrapper}>
                                <TextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Search..."
                                    style={styles.searchInput}
                                    autoFocus
                                />
                                <SearchIcon width={rs(18)} height={rs(18)} />
                            </View>
                            <View style={styles.divider} />
                        </>
                    )}

                    <FlatList
                        style={[styles.list, { maxHeight: rs(maxHeight) }]}
                        data={filteredItems}
                        keyExtractor={(item, index) => String(item.id ?? item.value ?? index)}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const isSelected = value && (value.id === item.id || value.value === item.value);

                            return (
                                <TouchableOpacity
                                    style={[styles.row, isSelected && styles.rowSelected]}
                                    onPress={() => handleSelect(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.rowContent}>
                                        <Text style={styles.rowTitle} numberOfLines={1}>
                                            {item.name || item.label || item.title || item}
                                        </Text>
                                        {item.code && (
                                            <Text style={styles.rowCode} numberOfLines={1}>
                                                {item.code}
                                            </Text>
                                        )}
                                    </View>
                                    {item.description && (
                                        <Text style={styles.rowDescription} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    {search ? 'No results found' : 'No items available'}
                                </Text>
                            </View>
                        )}
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
        color: '#233E55',
        marginBottom: rs(4),
        fontWeight: '500',
    },
    required: {
        color: '#E53935',
    },
    inputContainer: {
        borderRadius: rs(8),
        borderWidth: 1,
        borderColor: '#D9E4EE',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: rs(12),
        height: rs(44),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    disabledInput: {
        backgroundColor: '#EFEFF0',
        borderColor: '#E0E0E0',
    },
    inputError: {
        borderColor: '#E53935',
    },
    inputText: {
        fontSize: rs(14),
        color: '#233E55',
        flex: 1,
        marginRight: rs(8),
    },
    placeholderText: {
        color: '#7A7A7A',
    },
    errorText: {
        fontSize: rs(12),
        color: '#E53935',
        marginTop: rs(4),
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: rs(8),
        paddingHorizontal: rs(12),
        paddingTop: rs(12),
        paddingBottom: rs(8),
        borderWidth: 1,
        borderColor: '#D9E4EE',
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 5,
        maxHeight: SCREEN_HEIGHT * 0.6,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: rs(6),
        borderWidth: 1,
        borderColor: '#EFEFF0',
        paddingHorizontal: rs(10),
        height: rs(40),
        backgroundColor: '#FFFFFF',
        marginBottom: rs(8),
    },
    searchInput: {
        flex: 1,
        fontSize: rs(14),
        color: '#233E55',
        padding: 0,
    },
    divider: {
        height: 1,
        backgroundColor: '#EFEFF0',
        marginBottom: rs(8),
    },
    list: {
        maxHeight: rs(200),
    },
    row: {
        paddingVertical: rs(12),
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFF0',
    },
    rowSelected: {
        backgroundColor: '#ECF1F7',
        borderRadius: rs(4),
        paddingHorizontal: rs(8),
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: rs(4),
    },
    rowTitle: {
        fontSize: rs(14),
        fontWeight: '500',
        color: '#233E55',
        flex: 1,
    },
    rowCode: {
        fontSize: rs(12),
        color: '#7A7A7A',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: rs(6),
        paddingVertical: rs(2),
        borderRadius: rs(3),
        marginLeft: rs(8),
    },
    rowDescription: {
        fontSize: rs(12),
        color: '#7A7A7A',
        lineHeight: rs(16),
    },
    emptyContainer: {
        padding: rs(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: rs(14),
        color: '#7A7A7A',
        textAlign: 'center',
    },
});