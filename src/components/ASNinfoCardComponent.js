import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewMore from '../assets/icons/viewmore.svg';
import ViewLess from '../assets/icons/viewless.svg';

const dash = '—';
const CARD_BG = '#F6F8FA';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const ms = (size, factor = 0.35) => size + (scale(size) - size) * factor;

const ASNinfoCardComponent = ({
  receiptNumber,
  supplier,
  asnnumber,
  shippeddate,
  exprcteddate,
  supplierSite,
  carrier,
  packSlip,
  bol,
  waybill,
  airbill,
}) => {
  const [expanded, setExpanded] = useState(false);

  const rn = (receiptNumber ?? '').toString().trim() || dash;
  const sup = (supplier ?? '').toString().trim() || dash;
  const asn = (asnnumber ?? '').toString().trim() || dash;

  const site = (supplierSite ?? '').toString().trim() || dash;
  const carr = (carrier ?? '').toString().trim() || dash;
  const pack = (packSlip ?? '').toString().trim() || dash;
  const bolNo = (bol ?? '').toString().trim() || dash;
  const way = (waybill ?? '').toString().trim() || dash;
  const air = (airbill ?? '').toString().trim() || dash;

  const formatDate = (input) => {
    const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthMap = { jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11 };
    const out = (y,m,d) => `${String(d).padStart(2,'0')} ${monthShort[m]} ${y}`;
    if (input == null) return dash;
    const v = String(input).trim();
    if (!v) return dash;
    { const m = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(v); if (m) { const [, y, mm, dd] = m; const mi = Math.max(0, Math.min(11, Number(mm) - 1)); return out(Number(y), mi, Number(dd)); } }
    { const m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(v); if (m) { const [, dd, mm, y] = m; const mi = Math.max(0, Math.min(11, Number(mm) - 1)); return out(Number(y), mi, Number(dd)); } }
    { const parts = v.split(/\s+/); if (parts.length === 3) { const [dStr, monStr, yStr] = parts; const mi = monthMap[(monStr || '').toLowerCase()]; if (mi !== undefined && /^\d{1,2}$/.test(dStr) && /^\d{4}$/.test(yStr)) return out(Number(yStr), mi, Number(dStr)); } }
    { const n = Number(v); const dt = !Number.isNaN(n) && n > 0 ? new Date(n) : new Date(v); if (!Number.isNaN(dt.getTime())) { const y = dt.getUTCFullYear(); const m = dt.getUTCMonth(); const d = dt.getUTCDate(); return out(y, m, d); } }
    return v || dash;
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.toprow}>
          <View style={styles.topcardLeft}>
            <Text style={styles.labelText}>ASN Receipt</Text>
            <Text style={styles.valueText}>{rn}</Text>
          </View>
          <View style={styles.topcardRight}>
            <Text style={styles.labelText}>ASN Number</Text>
            <Text style={styles.valueText}>{asn}</Text>
          </View>
        </View>

        <View style={styles.bottomrow}>
          <View style={styles.bottomcardLeft}>            
            <Text style={styles.labelText}>Supplier</Text>
            <Text style={styles.valueText}>{sup}</Text>
          </View>
          <View style={styles.bottomcardRight}>
            <Text style={styles.labelText}>Supplier Site</Text>
            <Text style={styles.valueText}>{site}</Text>
          </View>
        </View>

        {expanded && (
          <>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
                <Text style={styles.labelText}>Carrier</Text>
                <Text style={styles.valueText}>{carr}</Text>
              </View>
              <View style={styles.bottomcardRight}>
                <Text style={styles.labelText}>Pack Slip</Text>
                <Text style={styles.valueText}>{pack}</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
                <Text style={styles.labelText}>BOL</Text>
                <Text style={styles.valueText}>{bolNo}</Text>
              </View>
              <View style={styles.bottomcardRight}>
                <Text style={styles.labelText}>Waybill</Text>
                <Text style={styles.valueText}>{way}</Text>
              </View>
            </View>
            <View style={styles.bottomrow}>
              <View style={styles.bottomcardLeft}>
                <Text style={styles.labelText}>Airbill</Text>
                <Text style={styles.valueText}>{air}</Text>
              </View>
              <View style={styles.bottomcardRight} />
            </View>
          </>
        )}

        <View style={styles.newbottomrow}>
          <View style={styles.newbottomcardLeft}>
            <Text style={styles.newlabelText}>
              Shipped Date: {formatDate(shippeddate)} {'\n'}Expected Receipt Date: {formatDate(exprcteddate)}
            </Text>
          </View>
          <View style={styles.newbottomcardRight}>
            <TouchableOpacity style={styles.viewMoreBtn} activeOpacity={0.7} onPress={() => setExpanded(!expanded)}>
              <Text style={styles.viewMoreText}>{expanded ? 'View Less' : 'View More'}</Text>
              {expanded ? (
                <ViewLess width={ms(14)} height={ms(14)} stroke="#033EFF" fill="none" />
              ) : (
                <ViewMore width={ms(14)} height={ms(14)} stroke="#033EFF" fill="none" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { backgroundColor: CARD_BG },
  card: {
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: scale(-12),
    marginHorizontal: scale(12),
    marginVertical: scale(6),
    borderRadius: scale(12),
    padding: scale(12),
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: scale(3),
      },
    }),
  },
  topcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), paddingBottom: scale(6), minWidth: 0 },
  topcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), paddingBottom: scale(6), minWidth: 0 },
  bottomcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), minWidth: 0 },
  bottomcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: scale(6), minWidth: 0 },
  toprow: { flex: 1, flexDirection: 'row', marginBottom: scale(0) },
  bottomrow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  newbottomrow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(10) },
  newbottomcardLeft: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: scale(6), minWidth: 0 },
  newbottomcardRight: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', minWidth: 0 },
  labelText: { fontSize: ms(10), color: '#666666', flex: 1, marginRight: scale(6) },
  valueText: { fontSize: ms(10), fontWeight: 'bold', color: '#1C1C1C', flex: 1, textAlign: 'left' },
  newlabelText: { fontSize: ms(8), color: '#666666', flex: 1, marginRight: scale(6) },
  viewMoreBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: ms(6), marginTop: ms(6) },
  viewMoreText: { fontSize: ms(10), marginRight: ms(-4), color: '#033EFF', textDecorationLine: 'underline', textDecorationColor: '#033EFF', fontWeight: '500' },
  openText: { color: 'green' },
  subLabel: { fontSize: ms(10), color: '#666666', marginTop: scale(4), marginBottom: scale(2) },
  column: { flex: 1 },
});

export default ASNinfoCardComponent;
