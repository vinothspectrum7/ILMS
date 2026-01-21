import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
   Modal,
} from 'react-native';
import ArrowLeft from '../../assets/icons/CycleCount_Icons/ArrowLeft .svg';
import ArrowRight from '../../assets/icons/CycleCount_Icons/ArrowRight .svg';

const CC_Calendar = ({
  visible,
  onClose,
  onDateSelect,
  initialDate = null,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(initialDate);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);


  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Get number of days in month
    const daysInMonth = lastDay.getDate();
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday as first day of week
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Generate calendar grid
    const weeks = [];
    let week = [];
    
    // Add empty cells for days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startOffset; i++) {
      const day = (prevMonthLastDay - startOffset + i + 1).toString();
      week.push(day);
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day.toString());
      if (week.length === 7) {
        weeks.push([...week]);
        week = [];
      }
    }
    
    // Add days from next month to complete the last week
    if (week.length > 0) {
      let nextDay = 1;
      while (week.length < 7) {
        week.push(nextDay.toString());
        nextDay++;
      }
      weeks.push(week);
    }
    
    return {
      year,
      month,
      monthName: `${monthNames[month]} ${year}`,
      dayHeaders,
      weeks,
      daysInMonth,
    };
  }, [currentDate]);

  const handleDaySelect = (day, isCurrentMonth) => {
    if (isCurrentMonth && day && !isNaN(parseInt(day))) {
      setSelectedDay(day);
      
      // Format date as DD/MM/YYYY
      const dayStr = day.padStart(2, '0');
      const monthStr = (calendarData.month + 1).toString().padStart(2, '0');
      const yearStr = calendarData.year.toString();
      const formattedDate = `${dayStr}/${monthStr}/${yearStr}`;
      
      if (onDateSelect) {
        onDateSelect(formattedDate);
      }
      
      // Close modal after selection
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Check if a day is from current month
  const isCurrentMonthDay = (day, weekIndex, dayIndex) => {
    const startOffset = calendarData.weeks[0].length - calendarData.daysInMonth;
    if (weekIndex === 0 && dayIndex < startOffset) {
      return false; // Previous month days
    }
    if (weekIndex === calendarData.weeks.length - 1) {
      // Check last week for next month days
      const daysSoFar = (weekIndex * 7) + dayIndex + 1 - startOffset;
      return daysSoFar <= calendarData.daysInMonth;
    }
    return true;
  };

  const years = useMemo(() => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 50;
  const endYear = currentYear + 50;
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
}, []);


  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.calendarContainer}>
          {/* Calendar Header with Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <ArrowLeft width={20} height={20} />
            </TouchableOpacity>
            
           <TouchableOpacity onPress={() => setYearPickerVisible(true)}>
  <Text style={styles.calendarMonthText}>
    {calendarData.monthName}
  </Text>
</TouchableOpacity>

            
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <ArrowRight width={20} height={20} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.dayHeadersContainer}>
            {calendarData.dayHeaders.map((day, index) => (
              <View key={`header-${index}`} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarData.weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  const isCurrentMonth = isCurrentMonthDay(day, weekIndex, dayIndex);
                  const isSelected = isCurrentMonth && day === selectedDay;
                  
                  return (
                    <TouchableOpacity
                      key={`day-${weekIndex}-${dayIndex}`}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        !isCurrentMonth && styles.dayCellOtherMonth
                      ]}
                      onPress={() => handleDaySelect(day, isCurrentMonth)}
                      disabled={!isCurrentMonth}
                    >
                      <Text style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        !isCurrentMonth && styles.dayTextOtherMonth
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Week Number Row */}
          <View style={styles.weekNumberRow}>
            {['1', '2', '3', '4', '5', '6', '7'].map((num, index) => (
              <View key={`weeknum-${index}`} style={styles.weekNumberCell}>
                <Text style={styles.weekNumberText}>{num}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CC_Calendar;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: 344,
    height: 367,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 4,
  },
  calendarMonthText: {
    fontFamily: 'Mulish',
    fontSize: 18,
    fontWeight: '700',
    color: '#242424',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    marginLeft: 10,
  },
  closeButtonText: {
    fontFamily: 'Mulish',
    fontSize: 24,
    fontWeight: '400',
    color: '#9D9FA3',
    lineHeight: 24,
  },
  dayHeadersContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontFamily: 'Mulish',
    fontSize: 12,
    fontWeight: '600',
    color: '#9D9FA3',
  },
  calendarGrid: {
    marginBottom: 15,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 1,
  },
  dayCellSelected: {
    backgroundColor: '#233E55',
  },
  dayCellOtherMonth: {
    opacity: 0.4,
  },
  dayText: {
    fontFamily: 'Mulish',
    fontSize: 14,
    fontWeight: '400',
    color: '#242424',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextOtherMonth: {
    color: '#9D9FA3',
  },
  weekNumberRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EFEFF0',
    paddingTop: 8,
  },
  weekNumberCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekNumberText: {
    fontFamily: 'Mulish',
    fontSize: 12,
    color: '#9D9FA3',
  },
});