import api from "./api";
import { API_ENDPOINTS } from "../config/config";

export const FetchData = async (org_id) => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_ASN_DATA(org_id));
    console.log("Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Fetch Error:", error.message, error.response?.data);
    throw error;
  }
};
export const UserLogin = async(formData)=>{
    try {
    const response = await api.post(API_ENDPOINTS.LOGIN,formData);
    console.log("Response Data:", response);
    return response;
  } catch (error) {
    console.error("Fetch Error:", error.message, error.response?.data);
    throw error;
  }  
}
export const GetASNPoItems = async(asn_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_SINGLE_ASN_DATA(asn_id));
        // console.log("Response Data:", response);
    return response.data;
  }catch (error) {
    console.error("Get ASN Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetReceivedASNPoItems = async(asn_rcpt_id,asn_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_SINGLE_ASN_RECEPT(asn_rcpt_id,asn_id));
        console.log("Received ASN Response Data:", response);
    return response.data;
  }catch (error) {
    console.error("Get Received ASN Error:", error.message, error.response?.data);
    throw error;
  }
}

export const GetLotDetails = async(lot_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_FUSION_LOT_DATA(lot_id));
        console.log("Response Data:lotdetails", response);
    return response.data;
  }catch (error) {
    console.error("Get lotdetails Error:", error.message, error.response?.data);
    throw error;
  }
}

export const GetInspectLineDetails = async(po_no,recId,po_line_no)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_FUSION_INSPECT_LINE_DATA(po_no,recId,po_line_no));
        console.log("Response Data:lotdetails", response);
    return response.data;
  }catch (error) {
    console.error("Get lotdetails Error:", error.message, error.response?.data);
    throw error;
  }
}

export const GetPoItems = async(org_id)=>{
  try {
    console.log("Response Data:popopo", org_id);
    const response = await api.post(API_ENDPOINTS.GET_ALL_PO_EBS_DATA('204'));
        console.log("Response Data:popopo", response);
    return response.data;
  }catch (error) {
    console.error("Get PO Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetSearchPoItems = async(status,po_no,org_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_ALL_PO_FUSION_SEARCH_DATA(status,po_no,org_id));
        console.log("Response Data:popopo", response);
    return response.data;
  }catch (error) {
    console.error("Get PO Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetFilterPoItems = async(status,org_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_ALL_PO_FUSION_FILTEER_DATA(status,org_id));
        console.log("Response Data:popopo", response);
    return response.data;
  }catch (error) {
    console.error("Get PO Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetReceivedItems = async(org_id)=>{
  try {
    console.log(API_ENDPOINTS.GET_RECEIVED_FUSION_DATA(org_id),"API_ENDPOINTS.GET_RECEIVED_FUSION_DATA(org_id)")
    const response = await api.get(API_ENDPOINTS.GET_RECEIVED_FUSION_DATA(org_id));
        console.log("Response Data:popopo", response);
    return response.data;
  }catch (error) {
    console.error("Get Received Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetSearchReceivedItems = async(org_id,po_no)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_RECEIVED_FUSION_SEARCH_DATA(org_id,po_no));
        console.log("Response Data:popopo", response);
    return response.data;
  }catch (error) {
    console.error("Get Received Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetSinglePO = async(po_no)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GET_SINGLE_PO_EBS_DATA(po_no));
    console.log(response,"GET_SINGLE_PO_DATA");
    return response.data;
    
  }catch (error) {
    console.error("Get Single PO Error:", error.message, error.response?.data);
    throw error.response?.data?.detail;
   
  }
}
export const GetSavedSinglePO = async(po_id,interface_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_SAVED_SINGLE_PO_DATA(po_id,interface_id));
    console.log(response,"GET_SAVED_SINGLE_PO_DATA");
    return response.data;
    
  }catch (error) {
    console.error("Get Saved Single PO Error:", error.message, error.response?.data);
    throw error.response?.data?.detail;
  }
}
export const GetSavedSingleASN = async(asn_id,interface_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_SAVED_SINGLE_ASN_DATA(asn_id,interface_id));
    console.log(response,"GET_SAVED_SINGLE_ASN_DATA");
    return response.data;
    
  }catch (error) {
    console.error("Get Saved Single ASN Error:", error.message, error.response?.data);
    throw error;
  }
}

export const GetSingleReceipt = async(org_id,receipt_num,po_num)=>{
  try {
    console.log(API_ENDPOINTS.GET_SINGLE_PURCHASE_RECEPT(org_id,receipt_num,po_num),"API_ENDPOINTS.GET_SINGLE_PURCHASE_RECEPT(org_id,receipt_num,po_num)")
    const response = await api.get(API_ENDPOINTS.GET_SINGLE_PURCHASE_RECEPT(org_id,receipt_num,po_num));
    console.log(response,"GET_SINGLE_PO_DATA");
    return response.data;
    
  }catch (error) {
    console.error("Error on Getting Single Purchase receipt:", error.message, error.response?.data);
    throw error;
  }
}
export const GetOrgsData = async()=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_ORGS_DATA);
    return response.data;
    
  }catch (error) {
    console.error("Get ORGS ERROR:", error.message, error.response?.data);
    throw error;
  }
}
export const GetInventryData = async(org_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_FUSION_SUB_INVENTORY_DATA(org_id));
    return response.data;
    
  }catch (error) {
    console.error("Get INVENTORY ERROR:", error.message, error.response?.data);
    throw error;
  }
}
export const GetLocatorsData = async(sub_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_LOCATOR_DATA(sub_id));
    return response.data;
    
  }catch (error) {
    console.error("Get LOCATORS ERROR:", error.message, error.response?.data);
    throw error;
  }
}
export const Submit_Receive_Qty = async(data)=>{
    try {
      console.log(data,"Submit_Receive_QtySubmit_Receive_Qty")
    const response = await api.post(API_ENDPOINTS.UPDATE_EBS_RECEIVED_QTY,data);
    console.log("Response Data:", response);
    return response.data;
  } catch (error) {
    console.error("Fetch Error:", error.message, error.response?.data);
    throw error.response?.data;
  }  
}
export const Save_Receive_Qty = async (data) => {
  try {
    const response = await api.patch(API_ENDPOINTS.SAVE_RECEIVED_QTY, data);
    return response.data;
  } catch (error) {
    throw (error?.response?.data ?? error);
  }
};
export const GetICPoItems = async(org_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_IC_PO_DATA(org_id));
        console.log("Response Data:INCOMP", response);
    return response.data;
  }catch (error) {
    console.error("Get Incomplete PO Error:", error.message, error.response?.data);
    throw error;
  }
}
export const DeleteIncompleteRecord = async(header_id)=>{
  try {
    const response = await api.delete(API_ENDPOINTS.DELETE_INCOMPLETE_RECORD(header_id));
        console.log("Delete:INCOMP", response);
    return response.data;
  }catch (error) {
    console.error("Delete Incomplete PO Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetItemImage = async(item_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_ITEM_IMAGE(item_id));
        console.log("Response Data:GET ITEM IMAGE", response);
    return response.data;
  }catch (error) {
    console.error("GET ITEM IMAGE ERROR:", error.message, error.response?.data);
    throw error;
  }
}
export const ReleasePO = async(po_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.RELEASE_PO(po_id));
        console.log("Response Data:Release PO", response);
    return response.data;
  }catch (error) {
    console.error("Release PO ERROR:", error.response?.data);
    throw error.response?.data?.detail;
  }
}
// Inventory flow API's
export const ItemsList = async(org_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.INVENTORY_ITEMS(org_id));
        console.log("RINVENTORY_ITEMS:", response);
    return response.data;
  }catch (error) {
    console.error("INVENTORY_ITEMS ERROR:", error.response?.data);
    throw error.response?.data?.detail;
  }
}
export const SubInventoryList = async(org_id,item_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.ITEMS_SUBINVENTORY(org_id,item_id));
        console.log("ITEMS_SUBINVENTORY:", response);
    return response.data;
  }catch (error) {
    console.error("ITEMS_SUBINVENTORY ERROR:", error.response?.data);
    throw error.response?.data?.detail;
  }
}
export const LocatorList = async(org_id,item_id,sub_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.ITEMS_SUB_LOCATOR(org_id,item_id,sub_id));
        console.log("ITEMS_SUB_LOCATOR:", response);
    return response.data;
  }catch (error) {
    console.error("ITEMS_SUB_LOCATOR ERROR:", error.response?.data);
    throw error.response?.data?.detail;
  }
}
export const SubInventoryTransferSubmit = async(data)=>{
    try {
    const response = await api.post(API_ENDPOINTS.SUB_INVENTORY_TRANSFER,data);
    console.log("SUB_INVENTORY_TRANSFER Data:", response);
    return response.data;
  } catch (error) {
    console.error("SUB_INVENTORY_TRANSFER Error:", error.message, error.response?.data);
    throw error.response?.data;
  }  
}
export const InventoryAdjustTransferSubmit = async(data,type)=>{
    try {
    const response = await api.post(API_ENDPOINTS.SUB_INVENTORY_ADJUST_TRANSFER(type),data);
    console.log("INVENTORY_ADJUST_TRANSFER Data:", response);
    return response.data;
  } catch (error) {
    console.error("INVENTORY_ADJUST_TRANSFER Error:", error.message, error.response?.data);
    throw error.response?.data;
  }  
}
export const RecentActivityList = async(org_id,limit)=>{
  try {
    const response = await api.get(API_ENDPOINTS.RECENT_LIST(org_id,limit));
        console.log("RECENT_LIST:", response);
    return response.data;
  }catch (error) {
    console.error("RECENT_LIST ERROR:", error.response?.data);
    throw error.response?.data?.detail;
  }
}
export const PriorityTaskList = async(org_id,limit)=>{
  try {
    const response = await api.get(API_ENDPOINTS.PRIORITY_LIST(org_id,limit));
        console.log("PRIORITY_LIST:", response);
    return response.data;
  }catch (error) {
    console.error("PRIORITY_LIST ERROR:", error.response?.data);
    throw error.response?.data?.detail;
  }
}
export const LPNList = async()=>{
  try {
    const response = await api.get(API_ENDPOINTS.LPN_LIST);
        console.log("LPN_LIST:", response);
    return response.data;
  }catch (error) {
    console.error("LPN_LIST ERROR:", error.response?.data);
    throw error.response?.data?.detail;
  }
}
export const Put_Away_Complete = async(data)=>{
    try {
    const response = await api.patch(API_ENDPOINTS.PUT_AWAY_COMPLETE,data);
    console.log("PUT_AWAY_COMPLETE Data:", response);
    return response.data;
  } catch (error) {
    console.error("PUT_AWAY_COMPLETE Error:", error.message, error.response?.data);
    throw error.response?.data;
  }  
}

export const GetSubInvItemList = async(org_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETSUBINVITEMLIST(org_id));
    return response.data;
    
  }catch (error) {
    console.error("Get SubInvItem ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetFROMSubInvData = async(org_id,item_code)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETFROMSUBINVLIST(org_id,item_code));
    return response.data;
    
  }catch (error) {
    console.error("Get FROMSUBINV ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetAvailableStockData = async(org_id,item_code,sub_inv_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETAVAILABLESTOCK(org_id,item_code,sub_inv_id));
    console.log(response.data)
    return response.data;
    
  }catch (error) {
    console.error("Get AvailableStock ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetAvailableItemStockData = async(org_id,item_code)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETITEMAVAILABLESTOCK(org_id,item_code));
    console.log(response.data)
    return response.data;
    
  }catch (error) {
    console.error("Get AvailableStock ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetAvailableLocatorStockData = async(org_id,item_code,sub_inv_id,locator_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETAVAILABLELOCATORSTOCK(org_id,item_code,sub_inv_id,locator_id));
    console.log(response.data)
    return response.data;
    
  }catch (error) {
    console.error("Get AvailableLocatorStock ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetTOSubInvData = async(org_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETTOSUBINVLIST(org_id));
    return response.data;
    
  }catch (error) {
    console.error("Get TOSUBINV ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetTOLocatorData = async(org_id,sub_inv_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETTOLOCATORINVLIST(org_id,sub_inv_id));
    return response.data;
    
  }catch (error) {
    console.error("Get TOLOCATOR ERROR:", error.message, error.response?.data);
    throw error;
  }
} 

export const GetShippingSummaryData = async(org_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GET_SHIPPING_EBS_SUMMARY_DATA(org_id));
    return response.data;
    
  }catch (error) {
    console.error("Get SHIPPING_EBS_SUMMARY_DATA ERROR:", error.message, error.response?.data);
    throw error;
  }
} 

export const GetShippingPickSlipNumData = async(org_id,pickslip_no)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GET_SHIPPING_EBS_PICKSLIP_NUM_DATA(org_id,pickslip_no));
    return response.data;
    
  }catch (error) {
    console.error("Get SHIPPING_EBS_PICKSLIP_NUM_DATA ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetShippingDeliveryIdData = async(org_id,delivery_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GET_SHIPPING_EBS_DELIVERY_ID_DATA(org_id,delivery_id));
    return response.data;
    
  }catch (error) {
    console.error("Get SHIPPING_EBS_DELIVERY_ID_DATA ERROR:", error.message, error.response?.data); 
  }
}
export const GetFromLocatorsData = async(org_id,item_code,sub_inv_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETFROMLOCATORSDATA(org_id,item_code,sub_inv_id));
    console.log(response.data)
    return response.data;
    
  }catch (error) {
    console.error("Get FROM LOCATOR ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetShippingSalesOrderNumData = async(org_id,so_number)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GET_SHIPPING_EBS_SALES_ORDER_NUM_DATA(org_id,so_number));
    return response.data;
    
  }catch (error) {
    console.error("Get SHIPPING_EBS_SALES_ORDER_NUM_DATA ERROR:", error.message, error.response?.data);
    throw error;
  }
}

export const GetShippingPickOrderData = async(org_id,delivery_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GET_SHIPPING_EBS_PICK_ORDER_DATA(org_id,delivery_id));
    return response.data;
    
  }catch (error) {
    console.error("Get SHIPPING_EBS_PICK_ORDER_DATA ERROR:", error.message, error.response?.data);
    throw error;
  }
} 

export const GetShippingPickItemsData = async(org_id,delivery_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GET_SHIPPING_EBS_PICK_ITEMS_DATA(org_id,delivery_id));
    return response.data;
    
  }catch (error) {
    console.error("Get SHIPPING_EBS_PICK_ITEMS_DATA ERROR:", error.message, error.response?.data); 
  }
}

export const GetInventoryLotsData = async(org_id,item_code,sub_inv_id)=>{
  try {
    const response = await api.post(API_ENDPOINTS.GETINVENTORYLOCATORSDATA(org_id,item_code,sub_inv_id));
    console.log(response.data)
    return response.data;
    
  }catch (error) {
    console.error("Get INVENTORY LOTS ERROR:", error.message, error.response?.data);
    throw error;
  }
}