import ApiConfig, { getHeader } from "../config/api.js";
import ApiEndpoints from "../constants/apiEndpoints.js";

export const getUserTrades = async (wallet, chain, page) => {
  let url = `${
    ApiEndpoints.user_endpoints.GET_USER_TRADE + "/" + wallet
  }?page=${page}&chain_id=${chain}`;
  return await ApiConfig.get(url, await getHeader());
};

export const getUserActivities = async (wallet, chain, page) => {
  let url = `${
    ApiEndpoints.user_endpoints.GET_USER_ACTIVITY + "/" + wallet
  }?chain_id=${chain}&page=${page}`;
  return await ApiConfig.get(url, await getHeader());
};

export const getQuickUpdates = async (wallet) => {
  return await ApiConfig.get(
    ApiEndpoints.user_endpoints.GET_QUICK_UPADTE + "/" + wallet,
    await getHeader()
  );
};

export const uploadImage = async (data) => {
  return await ApiConfig.post(
    ApiEndpoints.user_endpoints.UPLOAD_IMAGE,
    data,
    await getHeader(true)
  );
};
