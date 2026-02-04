import ApiConfig from "../config/api.js";
import ApiEndpoints from "../constants/apiEndpoints.js";

export const loginUser = async (credentials) => {
  return await ApiConfig.post(
    ApiEndpoints.auth_endpoints.POST_LOGIN_USER,
    credentials
  );
};
