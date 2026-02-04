import ApiConfig, { getHeader } from "../config/api.js";
import ApiEndpoints from "../constants/apiEndpoints.js";

export const getAllPremarketTrade = async (page, type, search, chainId) => {
  // Start constructing the URL
  let url = `${ApiEndpoints.premarket_endpoints.GET_PREMARKET}?page=${page}&type=${type}`;
  if (search) {
    url += `&name=${encodeURIComponent(search)}`;
  }
  if (chainId) {
    url += `&chain_id=${encodeURIComponent(chainId)}`;
  }
  return await ApiConfig.get(url, await getHeader());
};

export const getPremarketTrade = async (wallet, chainId, page, search) => {
  // Start constructing the URL
  let url = `${
    ApiEndpoints.premarket_endpoints.GET_PREMARKET + "/" + wallet
  }?page=${page}&chain_id=${chainId}`;
  if (search) {
    url += `&name=${encodeURIComponent(search)}`;
  }
  return await ApiConfig.get(url, await getHeader());
};

export const postPremarketTrade = async (tradeData) => {
  return await ApiConfig.post(
    ApiEndpoints.premarket_endpoints.POST_PREMARKET,
    tradeData,
    await getHeader()
  );
};

export const postPremarketActivity = async (activityData) => {
  return await ApiConfig.post(
    ApiEndpoints.premarket_endpoints.POST_PREMARKET_ACTIVITY,
    activityData,
    await getHeader()
  );
};

export const updatePremarketTrade = async (tradeData, _id) => {
  return await ApiConfig.put(
    ApiEndpoints.premarket_endpoints.UPDATE_PREMARKET_TRADE + "/" + _id,
    tradeData,
    await getHeader()
  );
};

export const updatePremarketInvestment = async (tradeData, _id) => {
  return await ApiConfig.put(
    ApiEndpoints.premarket_endpoints.UPDATE_PREMARKET_INVESTMENT + "/" + _id,
    tradeData,
    await getHeader()
  );
};

export const getPremarketTokens = async (chainId) => {
  return await ApiConfig.get(
    ApiEndpoints.premarket_endpoints.GET_PREMARKET_TOKEN +
      "?chain_id=" +
      chainId,
    await getHeader()
  );
};

export const addPremarketTokens = async (data) => {
  return await ApiConfig.post(
    ApiEndpoints.premarket_endpoints.ADD_PREMARKET_TOKEN,
    data,
    await getHeader()
  );
};

export const editPremarketTokens = async (data, id) => {
  return await ApiConfig.put(
    ApiEndpoints.premarket_endpoints.EDIT_PREMARKET_TOKEN + "/" + id,
    data,
    await getHeader()
  );
};

export const deletePremarketDeal = async (data, id) => {
  return await ApiConfig.patch(
    ApiEndpoints.premarket_endpoints.DELETE_PREMARKET + "/" + id,
    data,
    await getHeader()
  );
};

export const getPremarketCollateralTokens = async (chainId) => {
  return await ApiConfig.get(
    ApiEndpoints.premarket_endpoints.GET_PREMARKET_COLLATERAL_TOKEN +
      "?chain_id=" +
      chainId,
    await getHeader()
  );
};

export const getPremarketInvestment = async (wallet, page, chain_id) => {
  // Start constructing the URL
  let url = `${
    ApiEndpoints.premarket_endpoints.GET_PREMARKET_INVESTMENT + "/" + wallet
  }?page=${page}&chain_id=${chain_id}`;
  return await ApiConfig.get(url, await getHeader());
};
