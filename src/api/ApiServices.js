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
