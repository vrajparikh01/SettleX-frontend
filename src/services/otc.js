import ApiConfig, { getHeader } from "../config/api.js";
import ApiEndpoints from "../constants/apiEndpoints.js";

export const getTokenTrade = async (tradeId) => {
  return await ApiConfig.get(
    ApiEndpoints.trade_endpoints.GET_TOKEN_TRADE + "/" + tradeId,
    await getHeader()
  );
};

export const getAllTrades = async (page, type, search, chainId) => {
  console.log("Chain Id", chainId);
  // Start constructing the URL
  let url = `${ApiEndpoints.trade_endpoints.GET_ALL_TRADE}?page=${page}&type=${type}`;
  // Only append the search parameter if it has a value
  if (search) {
    url += `&name=${encodeURIComponent(search)}`;
  }
  if (chainId) {
    url += `&chain_id=${encodeURIComponent(chainId)}`;
  }
  return await ApiConfig.get(url, await getHeader());
};

export const postActivity = async (activityData) => {
  return await ApiConfig.post(
    ApiEndpoints.activity_endpoints.POST_ACTIVITY,
    activityData,
    await getHeader()
  );
};

export const postTrade = async (tradeData) => {
  return await ApiConfig.post(
    ApiEndpoints.trade_endpoints.POST_TRADE,
    tradeData,
    await getHeader()
  );
};

export const updateView = async (id) => {
  return await ApiConfig.put(
    ApiEndpoints.trade_endpoints.UPDATE_TRADE_COUNT + "/" + id,
    {},
    await getHeader()
  );
};

export const getTokens = async (chainId) => {
  return await ApiConfig.get(
    ApiEndpoints.token_endpoints.GET_ALL_TRADE + "/" + chainId,
    await getHeader()
  );
};

export const getTokenDetails = async (tokenId) => {
  return await ApiConfig.get(
    ApiEndpoints.token_endpoints.GET_TOKEN_DETAILS + "/" + tokenId,
    await getHeader()
  );
};

export const getTradeAnalytics = async (chainId) => {
  return await ApiConfig.get(
    ApiEndpoints.trade_endpoints.GET_TRADER_ANALYTICS + `?chain_id=${chainId}`,
    await getHeader()
  );
};

export const getAllBrokerTrades = async (page, type, search, chainId) => {
  // Start constructing the URL
  let url = `${ApiEndpoints.trade_endpoints.GET_BROKER_TRADE}?page=${page}&type=${type}`;
  // Only append the search parameter if it has a value
  if (search) {
    url += `&name=${encodeURIComponent(search)}`;
  }
  if (chainId) {
    url += `&chain_id=${encodeURIComponent(chainId)}`;
  }
  return await ApiConfig.get(url, await getHeader());
};
