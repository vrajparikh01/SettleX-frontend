import ApiConfig, { getHeader } from "../config/api.js";
import ApiEndpoints from "../constants/apiEndpoints.js";

export const addOtcToken = async (data) => {
  console.log("heeeee", data);
  return await ApiConfig.post(
    ApiEndpoints.admin_endpoints.POST_TOKENS,
    data,
    await getHeader()
  );
};

export const getOtcTokens = async (chainId, page) => {
  return await ApiConfig.get(
    ApiEndpoints.admin_endpoints.GET_TOKENS +
      `?chain_id=${chainId}&page=${page}`,
    await getHeader()
  );
};

export const addEquityDeal = async (data) => {
  return await ApiConfig.post(
    ApiEndpoints.admin_endpoints.ADD_TOKENS,
    data,
    await getHeader()
  );
};

export const getEquityTokens = async (chainId, page, wallet_address) => {
  return await ApiConfig.get(
    ApiEndpoints.admin_endpoints.GET_EQAUITY_TOKENS +
      `?chain_id=${chainId}&page=${page}&wallet_address=${wallet_address}`,
    await getHeader()
  );
};
