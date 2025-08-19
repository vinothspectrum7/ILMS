// api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config/config";
// import { useNavigation } from '@react-navigation/native';

const api = axios.create({
  baseURL: BASE_URL,
});
  // const navigation = useNavigation();
// APIs where token must NOT be sent
const excludedUrls = ["/token", "/auth/register"];

api.interceptors.request.use(async (config) => {
  // Attach token unless excluded
  if (!excludedUrls.some((url) => config.url.includes(url))) {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Handle Content-Type
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else if (config.data instanceof URLSearchParams) {
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  console.log("Axios Request Config:", config);
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.warn("Unauthorized → Token expired or invalid");
        await AsyncStorage.removeItem("access_token");
        // navigation.navigate('Login');
        // Optionally trigger navigation to Login
      } else if (status === 403) {
        console.error("Forbidden → You don’t have access");
      } else if (status >= 500) {
        console.error("Server error → Please try again later");
      } else {
        console.error("API Error:", error.response.data || error.message);
      }
    } else {
      console.error("Network error or server unreachable:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
