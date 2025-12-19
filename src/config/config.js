// Fusion API
export const BASE_URL ='http://3.17.31.222:8001';
// Local AWS
// export const BASE_URL ='http://3.17.31.222:8000';
// export const BASE_URL ='http://10.72.180.16:8000';
// export const BASE_URL = 'http://192.168.1.15:3003/api/v1/';
export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/token`,
  GET_ASN_DATA: (org_uuid) => `${BASE_URL}/asn/asn_headers/${org_uuid}/all/`,
  GET_SINGLE_ASN_DATA: (asn_id) => `${BASE_URL}/asn/asn_lines_po/${asn_id}/details`,
  GET_PO_DATA: (orgId) => `${BASE_URL}/purchase_orders/${orgId}/all`,
  GET_ALL_PO_DATA: (orgId) => `${BASE_URL}/purchase_orders/${orgId}/all?status=all`,
  GET_ALL_PO_FUSION_DATA: (orgId) => `${BASE_URL}/purchase_orders/all?status=OPEN`,
  GET_ALL_PO_FUSION_SEARCH_DATA: (po_id,status) => `${BASE_URL}/purchase_orders/all?status=${status}&po_number=${po_id}`,
  GET_ALL_PO_FUSION_FILTEER_DATA: (status) => `${BASE_URL}/purchase_orders/all?status=${status}`,
  GET_RECEIVED_DATA: (org_id) => `${BASE_URL}/purchase_orders/received/${org_id}/all`,
  GET_RECEIVED_FUSION_DATA: (org_id) => `${BASE_URL}/receipts/received/${org_id}/receipts`,
  GET_SINGLE_PO_DATA: (po_id) => `${BASE_URL}/purchase_orders/${po_id}`,
  GET_SAVED_SINGLE_PO_DATA: (po_id,interface_id) => `${BASE_URL}/receipt_interface/${po_id}/${interface_id}`,
  GET_SAVED_SINGLE_ASN_DATA: (asn_id,interface_id) => `${BASE_URL}/receipt_interface/asn/${asn_id}/${interface_id}`,
  GET_SINGLE_PURCHASE_RECEPT: (po_id) => `${BASE_URL}/purchase_orders/receipts/${po_id}/details?received_type=purchase_order`,
  GET_SINGLE_ASN_RECEPT: (asn_rcpt_id,asn_id) => `${BASE_URL}/purchase_orders/receipts/${asn_rcpt_id}/details?received_type=asn&asn_hdr_uuid=${asn_id}`,
  GET_ORGS_DATA: `${BASE_URL}/organizations`,
  GET_SUB_INVENTORY_DATA: (po_id) => `${BASE_URL}/organizations/${po_id}/subinventories`,
  GET_LOCATOR_DATA: (sub_inven_id) => `${BASE_URL}/organizations/${sub_inven_id}/locators`,
  UPDATE_RECEIVED_QTY: `${BASE_URL}/purchase_orders/update/batch_received_qty`,
  SAVE_RECEIVED_QTY: `${BASE_URL}/receipt_interface/batch_received_qty`,
  GET_IC_PO_DATA: (orgId) => `${BASE_URL}/receipt_interface/list/${orgId}/all`,
  DELETE_INCOMPLETE_RECORD: (header_id) => `${BASE_URL}/receipt_interface/delete/${header_id}`,
  GET_ITEM_IMAGE: (item_id) => `${BASE_URL}/purchase_orders/get_image/as_base64?item_uuid=${item_id}`,
  RELEASE_PO: (po_id) => `${BASE_URL}/purchase_orders/${po_id}/release`,
  INVENTORY_ITEMS: (org_id) => `${BASE_URL}/inventory/items?org_id=${org_id}`,
  ITEMS_SUBINVENTORY: (org_id,item_id) => `${BASE_URL}/inventory/items?org_id=${org_id}&item_id=${item_id}`,
  ITEMS_SUB_LOCATOR: (org_id,item_id,sub_id) => `${BASE_URL}/inventory/items?org_id=${org_id}&item_id=${item_id}&sub_inv_id=${sub_id}`,
  SUB_INVENTORY_TRANSFER: `${BASE_URL}/inventory/transfer`,
  SUB_INVENTORY_ADJUST_TRANSFER: (type) => `${BASE_URL}/inventory/adj_transfer?type=${type}`,
  RECENT_LIST: (org_id,limit) => `${BASE_URL}/dashboard/recent-activities?org_uuid=${org_id}&limit=${limit}`,
  PRIORITY_LIST: (org_id,limit) => `${BASE_URL}/dashboard/priority-tasks?org_uuid=${org_id}&limit=${limit}`,
  LPN_LIST: `${BASE_URL}/purchase_orders/get/lpn_num`





 
};