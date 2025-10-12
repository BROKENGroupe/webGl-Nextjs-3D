import axios from "axios";

const baseURL = "http://localhost:3001/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// const axiosPrivate = axios.create({
//   baseURL,
//   withCredentials: true,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const response = await axiosPrivate.post("/auth/refresh");
//         const { accessToken } = response.data;

//         localStorage.setItem("accessToken", accessToken);
//         return api(originalRequest);
//       } catch (refreshError) {
//         window.dispatchEvent(new CustomEvent("logout-event"));
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
