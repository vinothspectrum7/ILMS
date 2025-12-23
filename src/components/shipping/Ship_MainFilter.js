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

    const statusItems = [
        { id: 1, name: 'Pick' },
        { id: 2, name: 'Ready To Pack' },
    ];

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
        if (screenWidth < 375) return screenWidth - 16;
        if (screenWidth < 414) return screenWidth - 20;
        return Math.min(screenWidth - 24, 412);
    };

    const getDropdownWidth = () => {
        if (screenWidth < 375) return screenWidth - 16;
        if (screenWidth < 414) return screenWidth - 20;
        return Math.min(screenWidth - 24, 412);
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
        if (screenWidth < 375) return 10;
        if (screenWidth < 414) return 12;
        return 14;
    };

    const responsiveStyles = {
        containerWidth: getResponsiveWidth(),
        dropdownWidth: getDropdownWidth(),
        chipLayout: getChipLayout(),
        chipGap: getChipGap(),
        dropdownPadding: getDropdownPadding(),
    };

    const handleStatusChange = (value) => {
        onFilterChange('selectedStatus', value);
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
            setActiveDropdown(null);
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
                            width: responsiveStyles.dropdownWidth,
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
                                        responsiveStyles.chipLayout === 'column' && styles.verticalChip,
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
                                <DropdownIcon width={14} height={14} />
                            </TouchableOpacity>
                        )}
                    </View>
                );

            case 'Status':
                return (
                    <View style={[
                        styles.pickDropdown,
                        {
                            width: responsiveStyles.dropdownWidth,
                            padding: responsiveStyles.dropdownPadding
                        }
                    ]}>
                        <Text style={styles.pickHeading}>Status</Text>
                        <View style={styles.dropdownContainer}>
                            <Ship_DropDown
                                placeholder="Select Status"
                                value={filters.selectedStatus}
                                onChange={handleStatusChange}
                                items={statusItems}
                                showSearch={true}
                                containerStyle={{ marginBottom: 0 }}
                                inputStyle={styles.customDropdownInput}
                            />
                        </View>
                    </View>
                );

            case 'Item':
                return (
                    <View style={[
                        styles.pickDropdown,
                        {
                            width: responsiveStyles.dropdownWidth,
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
                            width: responsiveStyles.dropdownWidth,
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
                            width: responsiveStyles.dropdownWidth,
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

    return (
        <View style={styles.wrapper}>
            <View style={[styles.container, { width: responsiveStyles.containerWidth }]}>
                <View style={styles.filterIconContainer}>
                    <FilterIcon width={25} height={26} />
                </View>

                <View style={styles.divider} />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                >
                    {headers.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.dropdown,
                                isFilterActive(item) && styles.dropdownFiltered,
                                activeDropdown === item && styles.dropdownActive,
                            ]}
                            onPress={() =>
                                setActiveDropdown(activeDropdown === item ? null : item)
                            }
                        >
                            <Text style={styles.dropdownText} numberOfLines={1}>
                                {item}
                            </Text>
                            <DropdownIcon width={14} height={14} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            {activeDropdown && (
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.overlay}
                    onPress={() => setActiveDropdown(null)}
                >
                    <View>
                        {renderDropdownContent()}
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginTop: -15,
        position: 'relative',
        zIndex: 1,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingHorizontal: 10,
        backgroundColor: '#ECF1F7',
        borderRadius: 8,
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 3,
    },
    filterIconContainer: {
        width: 32,
        alignItems: 'center',
    },
    divider: {
        width: 0.5,
        height: 26,
        backgroundColor: '#B1CADE',
        marginHorizontal: 8,
    },
    scrollView: {
        flex: 1,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: Math.max(8, screenWidth * 0.02),
        height: 36,
        marginRight: 8,
        minWidth: Math.max(80, screenWidth * 0.2),
        justifyContent: 'space-between',
    },
    dropdownActive: {
        backgroundColor: '#B1CADE',
    },
    dropdownFiltered: {
        backgroundColor: '#B1CADE', 
    },
    dropdownText: {
        fontSize: Math.max(10, screenWidth * 0.03),
        color: '#233E55',
        marginRight: 4,
        flexShrink: 1,
    },

    pickDropdown: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#D9E4EE',
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 2,
        elevation: 5,
        zIndex: 1000,
        position: 'absolute',
        top: 54,
        left: (screenWidth - (Math.min(screenWidth - 24, 412))) / 2,
    },
    pickHeading: {
        fontSize: Math.max(12, screenWidth * 0.035),
        fontWeight: '600',
        marginBottom: 10,
        color: '#233E55',
    },
    pickRow: {
        marginBottom: 12,
    },
    pickChip: {
        borderWidth: 1,
        borderColor: '#D9E4EE',
        borderRadius: 4,
        paddingVertical: Math.max(6, screenHeight * 0.008),
        paddingHorizontal: Math.max(8, screenWidth * 0.03),
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalChip: {
        width: '100%',
    },
    pickChipActive: {
        backgroundColor: '#ECF1F7',
        borderColor: '#EFEFF0',
    },
    pickChipText: {
        fontSize: Math.max(10, screenWidth * 0.03),
        color: '#233E55',
        textAlign: 'center',
    },
    selectField: {
        height: Math.max(36, screenHeight * 0.05),
        borderWidth: 1,
        borderColor: '#EFEFF0',
        borderRadius: 4,
        paddingHorizontal: Math.max(10, screenWidth * 0.03),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
    },
    selectText: {
        fontSize: Math.max(11, screenWidth * 0.032),
        color: '#7A7A7A',
        flex: 1,
        marginRight: 8,
    },
    dropdownContainer: {
        marginTop: 8,
    },
    customDropdownInput: {
        height: 36,
        borderColor: '#EFEFF0',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
});

export default FilterBar;