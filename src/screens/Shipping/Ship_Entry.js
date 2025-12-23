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

import SubInvIcon from '../../assets/icons/sub_inv_transfer.svg';
import PickIcon from '../../assets/icons/Ship_Icons/PickIcon.svg';
import PackIcon from '../../assets/icons/Ship_Icons/PackIcon.svg';
import ArrowRightIcon from '../../assets/icons/Ship_Icons/ArrowRightIcon.svg';
import CardDecor from '../../assets/icons/Inv_Menu_bg.svg';

const BG = '#FFFFFF';
const CARD_BG = '#F5F5F6';
const TEXT_DARK = '#233E55';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;
const CARD_RADIUS = 18;

function ShipEntry() {
    const navigation = useNavigation();

    const MENU = [
        {
            title: 'Shipping Transactions',
            route: 'ShipDashboard',
            Icon: SubInvIcon,
        },
        {
            title: 'Pick',
            route: 'Pick',
            Icon: PickIcon,
        },
        {
            title: 'Pack',
            route: 'AutoPack',
            Icon: PackIcon,
        },
        {
            title: 'Label Printing',
            route: null,
            Icon: PackIcon,
        },
        {
            title: 'Ship Confirm',
            route: null,
            Icon: PackIcon,
        },
    ];

    const CARD_WIDTH = Math.min(372, SCREEN_WIDTH - ms(32));

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
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {MENU.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.card, { width: CARD_WIDTH }]}
                        onPress={() => {
                            if (item.route) {
                                navigation.navigate(item.route);
                            }
                        }}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${item.title}`}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                        <View style={styles.leftIcon}>
                            <item.Icon width={scale(24)} height={scale(24)} />
                        </View>

                        <Text style={styles.title}>{item.title}</Text>

                        <View style={styles.arrowContainer}>
                            <ArrowRightIcon width={20} height={20} />
                        </View>

                        <View style={styles.decorWrap} pointerEvents="none">
                            <CardDecor width="100%" height={scale(22)} />
                        </View>
                    </TouchableOpacity>
                ))}
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
    content: {
        paddingHorizontal: ms(16),
        paddingVertical: ms(12),
        gap: ms(16),
        alignItems: 'center',
    },
    card: {
        backgroundColor: CARD_BG,
        borderRadius: CARD_RADIUS,
        paddingVertical: ms(18),
        paddingHorizontal: ms(16),
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    leftIcon: {
        width: ms(44),
        height: ms(44),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: ms(12),
        backgroundColor: 'transparent',
    },
    title: {
        flex: 1,
        color: TEXT_DARK,
        fontFamily: 'Mulish',
        fontWeight: '800',
        fontSize: ms(16),
        letterSpacing: 0.2,
    },
    arrowContainer: {
        marginLeft: ms(8),
    },
    decorWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        resizeMode: 'stretch',
        marginBottom: -5,
    },
});