import axios from "axios";

export const getHeader = async (isFile = false) => {
  return {
    headers: {
      "Content-Type": isFile ? "" : "application/json",
      "ngrok-skip-browser-warning": 0,
    },
  };
};

const ApiConfig = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

export default ApiConfig;
