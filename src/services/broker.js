import ApiConfig, { getHeader } from "../config/api.js";
import ApiEndpoints from "../constants/apiEndpoints.js";

export const generateLink = async (brokerData) => {
  console.log("heeeee", brokerData);
  return await ApiConfig.post(
    ApiEndpoints.broker_endpoints.GENERATE_LINK,
    brokerData,
    await getHeader()
  );
};

export const getBrokerLinkData = async (id) => {
  return await ApiConfig.get(
    ApiEndpoints.broker_endpoints.GET_LINK_DATA + "/" + id,
    await getHeader()
  );
};

export const getBrokersDeal = async (address, chainId, page) => {
  return await ApiConfig.get(
    ApiEndpoints.broker_endpoints.BROKER_LIST +
      "/" +
      address +
      `?chain_id=${chainId}&page=${page}`,
    await getHeader()
  );
};

// export const getAllTrades = async (page, type, search) => {
//   // Start constructing the URL
//   let url = `${ApiEndpoints.trade_endpoints.GET_ALL_TRADE}?page=${page}&type=${type}`;
//   // Only append the search parameter if it has a value
//   if (search) {
//     url += `&name=${encodeURIComponent(search)}`;
//   }
//   return await ApiConfig.get(url, await getHeader());
// };

// export const postActivity = async (activityData) => {
//   return await ApiConfig.post(
//     ApiEndpoints.activity_endpoints.POST_ACTIVITY,
//     activityData,
//     await getHeader()
//   );
// };
