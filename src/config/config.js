export const BASE_URL = 'http://10.72.180.16:8000';
// export const BASE_URL = 'http://192.168.1.15:3003/api/v1/';
export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/token`,
  GET_ASN_DATA: (orgId) => `${BASE_URL}/asn/asn_headers/${orgId}/all`,
  GET_SINGLE_ASN_DATA: (asn_id) => `${BASE_URL}/asn/asn/${asn_id}`

};