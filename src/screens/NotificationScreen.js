import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import GlobalHeaderComponent from '../components/GlobalHeaderComponent';

const BRAND_BG = '#233E55';
const SECONDARY_BG = '#EDEFF2';
const PRIMARY_TEXT = '#233E55';
const BODY_TEXT = '#4F5B67';
const BUTTON_PRIMARY_BG = '#233E55';
const BUTTON_PRIMARY_TEXT = '#FFFFFF';
const BUTTON_SECONDARY_BG = '#D3DCE6';
const BUTTON_SECONDARY_TEXT = '#233E55';
const CLEAR_ALL = '#233E55';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const initialNotifications = [
  {
    id: '1',
    title: 'Critical: PO Overdue Receipt',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    dateTime: new Date().toISOString(),
    isRead: false,
  },
  {
    id: '2',
    title: 'Critical: PO Overdue Receipt',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    dateTime: new Date(new Date().setMinutes(new Date().getMinutes() - 15)).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    title: 'Critical: PO Overdue Receipt',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    dateTime: '2025-08-25T10:04:00',
    isRead: false,
  },
  {
    id: '4',
    title: 'Critical: PO Overdue Receipt',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    dateTime: '2025-08-20T09:30:00',
    isRead: false,
  },
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  const mm = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${mm} ${ampm}`;
}

function formatDate(date) {
  const day = date.getDate();
  const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
  const year = date.getFullYear();
  return `${day < 10 ? `0${day}` : day} ${monthShort} ${year}`;
}

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showEmpty, setShowEmpty] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const { todayNotifications, earlierNotifications } = useMemo(() => {
    if (showEmpty || notifications.length === 0) {
      return { todayNotifications: [], earlierNotifications: [] };
    }

    const today = new Date();
    const todayList = [];
    const earlierList = [];

    notifications.forEach(n => {
      const dt = new Date(n.dateTime);
      const item = { ...n, _dt: dt };
      if (isSameDay(dt, today)) {
        todayList.push(item);
      } else {
        earlierList.push(item);
      }
    });

    todayList.sort((a, b) => b._dt - a._dt);
    earlierList.sort((a, b) => b._dt - a._dt);

    return { todayNotifications: todayList, earlierNotifications: earlierList };
  }, [notifications, showEmpty]);

  const handleClearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setShowEmpty(true);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCardAction = id => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    navigation.navigate('Home');
  };

  const renderNotificationCard = (item, isToday) => {
    const timeLabel = isToday
      ? formatTime(item._dt)
      : `${formatDate(item._dt)} - ${formatTime(item._dt)}`;
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardTime}>{timeLabel}</Text>
        </View>
        <Text style={styles.cardMessage} numberOfLines={3}>
          {item.message}
        </Text>
        <View style={styles.cardButtonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleCardAction(item.id)}
          >
            <Text style={styles.primaryButtonText}>Process Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleCardAction(item.id)}
          >
            <Text style={styles.secondaryButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const showNoData =
    showEmpty || notifications.length === 0 || (todayNotifications.length === 0 && earlierNotifications.length === 0);

  return (
    <View style={styles.container}>
      <GlobalHeaderComponent
        organizationName="ENV"
        screenTitle={`Notifications (${unreadCount})`}
        notificationCount={unreadCount}
        onBack={handleBack}
        onNotificationPress={() => {}}
      />
      <View style={styles.contentWrapper}>
        {showNoData ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateSubtitle}>
              You’re all caught up.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.todayHeaderRow}>
              <Text style={styles.sectionTitle}>Today</Text>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleClearAll}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {todayNotifications.map(n => renderNotificationCard(n, true))}
              {earlierNotifications.length > 0 && (
                <Text style={[styles.sectionTitle, styles.earlierLabel]}>
                  Earlier
                </Text>
              )}
              {earlierNotifications.map(n =>
                renderNotificationCard(n, false)
              )}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_BG,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: SECONDARY_BG,
    paddingTop: ms(14),
  },
  todayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(18),
    marginBottom: ms(6),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: PRIMARY_TEXT,
  },
  clearAllText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: CLEAR_ALL,
  },
  scrollContent: {
    paddingBottom: ms(24),
  },
  card: {
    marginHorizontal: ms(18),
    marginTop: ms(10),
    paddingVertical: ms(14),
    paddingHorizontal: ms(16),
    backgroundColor: '#FFFFFF',
    borderRadius: ms(18),
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ms(6),
  },
  cardTitle: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '700',
    color: PRIMARY_TEXT,
    marginRight: ms(10),
  },
  cardTime: {
    fontSize: ms(12),
    fontWeight: '500',
    color: BODY_TEXT,
  },
  cardMessage: {
    fontSize: ms(13),
    color: BODY_TEXT,
    lineHeight: ms(18),
    marginBottom: ms(12),
  },
  cardButtonRow: {
    flexDirection: 'row',
    columnGap: ms(10),
  },
  primaryButton: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(18),
    borderRadius: ms(10),
    backgroundColor: BUTTON_PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: BUTTON_PRIMARY_TEXT,
  },
  secondaryButton: {
    paddingVertical: ms(8),
    paddingHorizontal: ms(18),
    borderRadius: ms(10),
    backgroundColor: BUTTON_SECONDARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: BUTTON_SECONDARY_TEXT,
  },
  earlierLabel: {
    marginTop: ms(16),
    marginHorizontal: ms(18),
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: PRIMARY_TEXT,
    marginBottom: ms(6),
  },
  emptyStateSubtitle: {
    fontSize: ms(14),
    color: BODY_TEXT,
  },
});
