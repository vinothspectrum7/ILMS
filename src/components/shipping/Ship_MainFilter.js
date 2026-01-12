import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import FilterIcon from '../../assets/icons/Ship_Icons/FilterIcon.svg';
import DropdownIcon from '../../assets/icons/Ship_Icons/DropdownIcon.svg';
import Ship_DropDown from './Ship_DropDown';
import DropDown from '../../assets/icons/Ship_Icons/DropDown.svg';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

function FilterBar({ filters, onFilterChange }) {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const headers = ['Pick Option', 'Status', 'Item', 'Exception', 'Organization'];

    const pickSlipNumbers = [
        { id: 1, name: 'PS3456' },
        { id: 2, name: 'PS3457' },
        { id: 3, name: 'PS3458' },
        { id: 4, name: 'PS3459' },
        { id: 5, name: 'PS3460' },
        { id: 6, name: 'PS3461' },
        { id: 7, name: 'PS3462' },
        { id: 8, name: 'PS3463' },
        { id: 9, name: 'PS3464' },
        { id: 10, name: 'PS3465' },
        { id: 11, name: 'PS3466' },
        { id: 12, name: 'PS3467' },
    ];

    // const statusOptions = ['Picked', 'Pending', 'Completed', 'Unreleased', 'Released'];
    const statusOptions = ['Pick', 'Ready To Pack', 'Ready To Ship'];

    const itemItems = [
        { id: 1, name: 'Item A' },
        { id: 2, name: 'Item B' },
        { id: 3, name: 'Item C' },
        { id: 4, name: 'Item D' },
        { id: 5, name: 'Item E' },
        { id: 6, name: 'Item F' },
    ];

    const exceptionItems = [
        { id: 1, name: 'None' },
        { id: 2, name: 'Damaged' },
        { id: 3, name: 'Missing' },
        { id: 4, name: 'Delayed' },
    ];

    const organizationItems = [
        { id: 1, name: 'ENV' },
        { id: 2, name: 'ORG1' },
        { id: 3, name: 'ORG2' },
    ];

    const getResponsiveWidth = () => {
        return screenWidth - 16;
    };

    const getChipLayout = () => {
        if (screenWidth < 375) return 'column';
        return 'row';
    };

    const getChipGap = () => {
        if (screenWidth < 375) return 6;
        if (screenWidth < 414) return 8;
        return 10;
    };

    const getDropdownPadding = () => {
        if (screenWidth < 375) return 12;
        if (screenWidth < 414) return 14;
        return 16;
    };

    const getItemWidth = (header) => {
        const baseWidth = 20;
        const iconWidth = 20;
        const charWidth = 8;

        const textWidth = header.length * charWidth;
        const totalWidth = baseWidth + iconWidth + textWidth;

        const minWidth = 90;
        const maxWidth = 150;

        return Math.max(minWidth, Math.min(totalWidth, maxWidth));
    };

    const responsiveStyles = {
        containerWidth: getResponsiveWidth(),
        chipLayout: getChipLayout(),
        chipGap: getChipGap(),
        dropdownPadding: getDropdownPadding(),
    };

    const handleStatusChange = (status) => {
        if (filters.selectedStatus === status) {
            onFilterChange('selectedStatus', null);
        } else {
            onFilterChange('selectedStatus', status);
        }
        setActiveDropdown(null);
    };

    const handleItemChange = (value) => {
        onFilterChange('selectedItem', value);
        setActiveDropdown(null);
    };

    const handleExceptionChange = (value) => {
        onFilterChange('selectedException', value);
        setActiveDropdown(null);
    };

    const handleOrganizationChange = (value) => {
        onFilterChange('selectedOrganization', value);
        setActiveDropdown(null);
    };

    const handlePickSlipChange = (value) => {
        onFilterChange('selectedPickSlip', value);
        setActiveDropdown(null);
    };

    const handlePickTypeChange = (type) => {
        onFilterChange('pickType', type);
        if (type !== 'Pick Slip Number') {
            onFilterChange('selectedPickSlip', null);
        }
    };

    const isFilterActive = (header) => {
        switch (header) {
            case 'Pick Option':
                return (
                    filters.pickType !== 'Sales Order' ||
                    filters.selectedPickSlip !== null
                );
            case 'Status':
                return !!filters.selectedStatus;
            case 'Item':
                return !!filters.selectedItem;
            case 'Exception':
                return !!filters.selectedException;
            case 'Organization':
                return !!filters.selectedOrganization;
            default:
                return false;
        }
    };

    const renderDropdownContent = () => {
        if (!activeDropdown) return null;

        switch (activeDropdown) {
            case 'Pick Option':
                return (
                    <View style={[
                        styles.pickDropdown,
                        {
                            padding: responsiveStyles.dropdownPadding
                        }
                    ]}>
                        <Text style={styles.pickHeading}>Pick Option</Text>

                        <View style={[
                            styles.pickRow,
                            {
                                flexDirection: responsiveStyles.chipLayout,
                                gap: responsiveStyles.chipGap
                            }
                        ]}>
                            {['Sales Order', 'Delivery', 'Pick Slip Number'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.pickChip,
                                        filters.pickType === type && styles.pickChipActive,
                                    ]}
                                    onPress={() => handlePickTypeChange(type)}
                                >
                                    <Text style={styles.pickChipText} numberOfLines={1}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {filters.pickType === 'Pick Slip Number' && (
                            <View style={styles.dropdownContainer}>
                                <Ship_DropDown
                                    placeholder="Select Pick Slip Number"
                                    value={filters.selectedPickSlip}
                                    onChange={handlePickSlipChange}
                                    items={pickSlipNumbers}
                                    showSearch={true}
                                    containerStyle={{ marginBottom: 0 }}
                                    inputStyle={styles.customDropdownInput}
                                />
                            </View>
                        )}

                        {filters.pickType !== 'Pick Slip Number' && (
                            <TouchableOpacity style={styles.selectField}>
                                <Text style={styles.selectText} numberOfLines={1}>
                                    Select {filters.pickType}
                                </Text>
                                <DropDown width={14} height={14} />
                            </TouchableOpacity>
                        )}
                    </View>
                );

            case 'Status':
                return (
                    <View style={[
                        styles.pickDropdown,
                        {
                            padding: responsiveStyles.dropdownPadding
                        }
                    ]}>
                        <Text style={styles.pickHeading}>Status</Text>
                        
                        <View style={[
                            styles.pickRow,
                            {
                                flexDirection: responsiveStyles.chipLayout,
                                gap: responsiveStyles.chipGap
                            }
                        ]}>
                            {statusOptions.map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.pickChip,
                                        filters.selectedStatus === status && styles.pickChipActive,
                                    ]}
                                    onPress={() => handleStatusChange(status)}
                                >
                                    <Text style={styles.pickChipText} numberOfLines={1}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 'Item':
                return (
                    <View style={[
                        styles.pickDropdown,
                        {
                            padding: responsiveStyles.dropdownPadding
                        }
                    ]}>
                        <Text style={styles.pickHeading}>Item</Text>
                        <View style={styles.dropdownContainer}>
                            <Ship_DropDown
                                placeholder="Select Item"
                                value={filters.selectedItem}
                                onChange={handleItemChange}
                                items={itemItems}
                                showSearch={true}
                                containerStyle={{ marginBottom: 0 }}
                                inputStyle={styles.customDropdownInput}
                            />
                        </View>
                    </View>
                );

            case 'Exception':
                return (
                    <View style={[
                        styles.pickDropdown,
                        {
                            padding: responsiveStyles.dropdownPadding
                        }
                    ]}>
                        <Text style={styles.pickHeading}>Exception</Text>
                        <View style={styles.dropdownContainer}>
                            <Ship_DropDown
                                placeholder="Select Exception"
                                value={filters.selectedException}
                                onChange={handleExceptionChange}
                                items={exceptionItems}
                                showSearch={true}
                                containerStyle={{ marginBottom: 0 }}
                                inputStyle={styles.customDropdownInput}
                            />
                        </View>
                    </View>
                );

            case 'Organization':
                return (
                    <View style={[
                        styles.pickDropdown,
                        {
                            padding: responsiveStyles.dropdownPadding
                        }
                    ]}>
                        <Text style={styles.pickHeading}>Organization</Text>
                        <View style={styles.dropdownContainer}>
                            <Ship_DropDown
                                placeholder="Select Organization"
                                value={filters.selectedOrganization}
                                onChange={handleOrganizationChange}
                                items={organizationItems}
                                showSearch={true}
                                containerStyle={{ marginBottom: 0 }}
                                inputStyle={styles.customDropdownInput}
                            />
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    const handleCloseDropdown = () => {
        setActiveDropdown(null);
    };

    const getTotalItemsWidth = () => {
        return headers.reduce((total, header) => {
            return total + getItemWidth(header) + 6;
        }, 0);
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>

                <View style={styles.filterIconContainer}>
                    <FilterIcon width={25} height={26} />
                </View>

                <View style={styles.divider} />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { minWidth: Math.min(getTotalItemsWidth(), screenWidth - 50) }
                    ]}
                >
                    {headers.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.dropdown,
                                {
                                    width: getItemWidth(item),
                                    minWidth: getItemWidth(item),
                                },
                                isFilterActive(item) && styles.dropdownFiltered,
                                activeDropdown === item && styles.dropdownActive,
                            ]}
                            onPress={() =>
                                setActiveDropdown(activeDropdown === item ? null : item)
                            }
                        >
                            <Text
                                style={styles.dropdownText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                adjustsFontSizeToFit={false}
                            >
                                {item}
                            </Text>
                            <DropdownIcon
                                width={14}
                                height={14}
                                style={{
                                    transform: [
                                        { rotate: activeDropdown === item ? '180deg' : '0deg' }
                                    ],
                                }}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {activeDropdown && (
                <>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.overlay}
                        onPress={handleCloseDropdown}
                    />
                    <View style={styles.fullScreenDropdownWrapper}>
                        <View style={styles.fullScreenDropdownContainer}>
                            {renderDropdownContent()}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: -15,
        position: 'relative',
        zIndex: 100,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        width: '100%',
        paddingHorizontal: 8,
        backgroundColor: '#ECF1F7',
        borderRadius: 0,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
    },
    overlay: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 998,
    },
    filterIconContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    divider: {
        width: 0.5,
        height: 24,
        backgroundColor: '#B1CADE',
        marginHorizontal: 6,
        flexShrink: 0,
    },
    scrollView: {
        flex: 1,
        overflow: 'visible',
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
        flexGrow: 1,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 34,
        marginRight: 6,
        justifyContent: 'space-between',
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 1,
        elevation: 2,
        flexShrink: 0,
    },
    dropdownActive: {
        backgroundColor: '#B1CADE',
        borderColor: '#233E55',
    },
    dropdownFiltered: {
        backgroundColor: '#B1CADE',
    },
    dropdownText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 12,
        color: '#242424',
        marginRight: 6,
        flex: 1,
        textAlign: 'left',
        includeFontPadding: false,
        textAlignVertical: 'center',
        lineHeight: 12,
    },
    fullScreenDropdownWrapper: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 999,
        elevation: 6,
    },
    fullScreenDropdownContainer: {
        width: '100%',
        paddingHorizontal: 8,
    },
    pickDropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D9E4EE',
        width: '100%',
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    pickHeading: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 12,
        color: '#233E55',
        marginBottom: 12,
        lineHeight: 12,
        letterSpacing: 0,
    },
    pickRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    pickChip: {
        borderWidth: 1,
        borderColor: '#D9E4EE',
        borderRadius: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 32,
    },
    pickChipActive: {
        backgroundColor: '#ECF1F7',
        borderColor: '#D9E4EE',
        borderWidth: 1,
    },
    pickChipText: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 10,
        color: '#233E55',
        textAlign: 'center',
        lineHeight: 12,
        letterSpacing: 0,
    },
    selectField: {
        height: 36,
        borderWidth: 1,
        borderColor: '#EFEFF0',
        borderRadius: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    selectText: {
        fontFamily: 'Mulish',
        fontWeight: '400',
        fontSize: 12,
        color: '#595A5C',
        flex: 1,
        marginRight: 8,
        lineHeight: 14,
    },
    dropdownContainer: {
        marginTop: 8,
        width: '100%',
    },
    customDropdownInput: {
        height: 36,
        borderColor: '#EFEFF0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Mulish',
        fontWeight: '400',
        fontSize: 12,
        color: '#595A5C',
        width: '100%',
    },
});

export default FilterBar;