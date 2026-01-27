// api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { createNavigationContainerRef } from "@react-navigation/native";
import { BASE_URL } from "../config/config";
import { getCurrentPO, releasecurrentPO } from "./posession";

const api = axios.create({
  baseURL: BASE_URL,
});

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
// APIs where token must NOT be sent
const excludedUrls = ["auth/login", "/register", "auth/refresh"];
// Refresh control
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  const response = await axios.post(
    `${BASE_URL}/auth/refresh`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  const newAccessToken = response.data.access_token;

  await AsyncStorage.setItem("access_token", newAccessToken);

  return newAccessToken;
};


api.interceptors.request.use(async (config) => {
  // Attach access token
  if (!excludedUrls.some((url) => config.url.includes(url))) {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Content-Type handling
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else if (config.data instanceof URLSearchParams) {
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Access token expired
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // If refresh already in progress → queue request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh token expired → Logout
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again.",
          [
            {
              text: "OK",
              onPress: async () => {
                try {
                  const { currentPO, lockedByUser } = getCurrentPO();
                  if (currentPO && !lockedByUser) {
                    await releasecurrentPO(currentPO);
                  }

                  await AsyncStorage.multiRemove([
                    "access_token",
                    "refresh_token",
                  ]);
                  navigate("Login");
                } catch (e) {
                  console.error("Error during logout:", e);
                }
              },
            },
          ],
          { cancelable: false }
        );

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
