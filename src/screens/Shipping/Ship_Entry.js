import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../../components/GlobalHeaderComponent';

import ShippingTransactionsIcon from '../../assets/icons/Ship_Icons/ShippingTransactionsIcon.svg';
import PickIcon from '../../assets/icons/Ship_Icons/PickIcon.svg';
import PackIcon from '../../assets/icons/Ship_Icons/PackIcon.svg';
import LabelPrintingIcon from '../../assets/icons/Ship_Icons/LabelPrintingIcon.svg';
import ShipConfirmIcon from '../../assets/icons/Ship_Icons/ShipConfirmIcon.svg';

const BG = '#F5F5F6';
const TEXT_DARK = '#242424';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ShipEntry() {
    const navigation = useNavigation();

    const MENU_ITEMS = [
        {
            id: 1,
            title: 'Shipping\nTransactions',
            route: 'ShipDashboard',
            Icon: ShippingTransactionsIcon,
        },
        {
            id: 2,
            title: 'Pick',
            route: 'Pick',
            Icon: PickIcon,
        },
        {
            id: 3,
            title: 'Pack',
            route: 'AutoPack',
            Icon: PackIcon,
        },
        {
            id: 4,
            title: 'Label\nPrinting',
            route: null,
            Icon: LabelPrintingIcon,
        },
        {
            id: 5,
            title: 'Ship\nConfirm',
            route: null,
            Icon: ShipConfirmIcon,
        },
    ];

    const CARD_WIDTH = 118;
    const CARD_HEIGHT = 89;

    const renderCard = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => {
                if (item.route) {
                    navigation.navigate(item.route);
                }
            }}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <item.Icon width={22.32} height={22.32} />
            </View>

            <Text style={styles.cardTitle}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.safe}>
            <StatusBar backgroundColor="#233E55" barStyle="light-content" />

            <View style={{ backgroundColor: '#233E55' }}>
                <GlobalHeaderComponent
                    screenTitle="Shipping"
                    organizationName="ENV"
                    onBack={() => navigation.goBack()}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <View style={[styles.row, { marginBottom: 20 }]}>
                        {MENU_ITEMS.slice(0, 3).map(renderCard)}
                    </View>

                    <View style={styles.row}>
                        {MENU_ITEMS.slice(3, 5).map(renderCard)}

                        <View style={styles.emptyCard} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default ShipEntry;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: BG
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 40,
    },
    container: {
        paddingHorizontal: 22,
        marginTop: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    card: {
        width: 118,
        height: 89,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyCard: {
        width: 118,
        height: 89,
        backgroundColor: 'transparent',
    },
    iconContainer: {
        marginBottom: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontFamily: 'Mulish',
        fontWeight: '700',
        fontSize: 11,
        lineHeight: 13,
        letterSpacing: 0,
        textAlign: 'center',
        color: TEXT_DARK,
        paddingHorizontal: 2,
    },
});