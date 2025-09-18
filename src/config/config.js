export const BASE_URL ='http://3.17.31.222:8000';
// export const BASE_URL ='http://10.72.180.16:8000';
// export const BASE_URL = 'http://192.168.1.15:3003/api/v1/';
export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/token`,
  GET_ASN_DATA: (org_uuid) => `${BASE_URL}/asn/asn_headers/${org_uuid}/all/`,
  GET_SINGLE_ASN_DATA: (asn_id) => `${BASE_URL}/asn/asn_lines_po/${asn_id}/details`,
  GET_PO_DATA: (orgId) => `${BASE_URL}/purchase_orders/${orgId}/all`,
  GET_ALL_PO_DATA: (orgId) => `${BASE_URL}/purchase_orders/${orgId}/all?status=all`,
  GET_RECEIVED_DATA: (org_id) => `${BASE_URL}/purchase_orders/received/${org_id}/all`,
  GET_SINGLE_PO_DATA: (po_id) => `${BASE_URL}/purchase_orders/${po_id}`,
  GET_SAVED_SINGLE_PO_DATA: (po_id,interface_id) => `${BASE_URL}/receipt_interface/${po_id}/${interface_id}`,
  GET_SAVED_SINGLE_ASN_DATA: (asn_id,interface_id) => `${BASE_URL}/receipt_interface/asn/${asn_id}/${interface_id}`,
  GET_SINGLE_PURCHASE_RECEPT: (po_id) => `${BASE_URL}/purchase_orders/receipts/${po_id}/details`,
  GET_ORGS_DATA: `${BASE_URL}/organizations`,
  GET_SUB_INVENTORY_DATA: (po_id) => `${BASE_URL}/organizations/${po_id}/subinventories`,
  GET_LOCATOR_DATA: (sub_inven_id) => `${BASE_URL}/organizations/${sub_inven_id}/locators`,
  UPDATE_RECEIVED_QTY: `${BASE_URL}/purchase_orders/update/batch_received_qty`,
  SAVE_RECEIVED_QTY: `${BASE_URL}/receipt_interface/batch_received_qty`,
  GET_IC_PO_DATA: (orgId) => `${BASE_URL}/receipt_interface/list/${orgId}/all`,
  DELETE_INCOMPLETE_RECORD: (header_id) => `${BASE_URL}/receipt_interface/delete/${header_id}`,
  GET_ITEM_IMAGE: (item_id) => `${BASE_URL}/purchase_orders/get_image/as_base64?item_uuid=${item_id}`,
  RELEASE_PO: (po_id) => `${BASE_URL}/purchase_orders/${po_id}/release`


 
};