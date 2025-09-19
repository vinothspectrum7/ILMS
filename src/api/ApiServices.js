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
export const GetPoItems = async(org_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_ALL_PO_DATA(org_id));
        console.log("Response Data:popopo", response);
    return response.data;
  }catch (error) {
    console.error("Get PO Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetReceivedItems = async(org_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_RECEIVED_DATA(org_id));
        console.log("Response Data:popopo", response);
    return response.data;
  }catch (error) {
    console.error("Get Received Error:", error.message, error.response?.data);
    throw error;
  }
}
export const GetSinglePO = async(po_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_SINGLE_PO_DATA(po_id));
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
    throw error;
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

export const GetSingleReceipt = async(po_id)=>{
  try {
    const response = await api.get(API_ENDPOINTS.GET_SINGLE_PURCHASE_RECEPT(po_id));
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
    const response = await api.get(API_ENDPOINTS.GET_SUB_INVENTORY_DATA(org_id));
    return response.data;
    
  }catch (error) {
    console.error("Get ORGS ERROR:", error.message, error.response?.data);
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
    const response = await api.patch(API_ENDPOINTS.UPDATE_RECEIVED_QTY,data);
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