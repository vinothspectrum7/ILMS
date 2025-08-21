// export const BASE_URL ='http://192.168.1.15:8000';
export const BASE_URL = 'http://3.17.31.222:8000/docs#/';
export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/token`,
  GET_ASN_DATA: (orgId) => `${BASE_URL}/asn/asn_headers/${orgId}/all`,
  GET_SINGLE_ASN_DATA: (asn_id) => `${BASE_URL}/asn/asn/${asn_id}`,
  GET_PO_DATA: (orgId) => `${BASE_URL}/purchase_orders/${orgId}/all`,
  GET_SINGLE_PO_DATA: (orgId) => `${BASE_URL}/purchase_orders/${orgId}`,


};