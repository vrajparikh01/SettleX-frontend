// UPDATE -- PUT
// GET_ALL -- TO_GET_MULTIPLE_RECORDS
// GET -- TO_GET_SINGLE_RECORD
// DELETE -- TO_DELETE_SINLE_RECORD
// POST -- TO_POST_SINGLE_RECORD
// PATCH -- TO_PATCH_DATA_IN_RECORD

const ApiEndpoints = {
  activity_endpoints: {
    POST_ACTIVITY: "/activity/",
  },
  auth_endpoints: {
    POST_LOGIN_USER: "/auth/login",
  },
  broker_endpoints: {
    GENERATE_LINK: "/brokerlinks",
    GET_LINK_DATA: "/brokerlinks",
    BROKER_LIST: "/brokerlinks/list-for-broker",
  },
  admin_endpoints: {
    GET_TOKENS: "/tokens/tokens-added-by-admin",
    POST_TOKENS: "/tokens",
    ADD_TOKENS: "/equity",
    GET_EQAUITY_TOKENS: "/equity",
  },
  premarket_endpoints: {
    POST_PREMARKET: "/premarket/trade",
    GET_PREMARKET: "/premarket/trade",
    DELETE_PREMARKET: "/premarket/trade/cancel",
    GET_PREMARKET_INVESTMENT: "/premarket/activity/investment",
    POST_PREMARKET_ACTIVITY: "/premarket/activity",
    UPDATE_PREMARKET_TRADE: "/premarket/trade",
    UPDATE_PREMARKET_INVESTMENT: "/premarket/activity/investment",
    GET_PREMARKET_TOKEN: "/premarket/tokens",
    ADD_PREMARKET_TOKEN: "/premarket/tokens",
    EDIT_PREMARKET_TOKEN: "/premarket/tokens",
    GET_PREMARKET_COLLATERAL_TOKEN: "/premarket/tokens/collateral-list",
  },
  token_endpoints: {
    GET_ALL_TRADE: "/tokens/chain",
    GET_TOKEN_DETAILS: "/tokens",
  },
  trade_endpoints: {
    POST_TRADE: "/trade",
    GET_TRADE: "/trade",
    GET_ALL_TRADE: "/trade/",
    GET_TOKEN_TRADE: "/trade/get-tokens-trades",
    GET_TRADER_ANALYTICS: "/trade/most-active-selling-trending",
    UPDATE_TRADE_COUNT: "/trade/view",
    GET_BROKER_TRADE: "/trade/brokers",
  },
  user_endpoints: {
    GET_USER_TRADE: "/trade/user-specific",
    GET_USER_ACTIVITY: "/activity/activity-for-user",
    GET_QUICK_UPADTE: "/users/quick-update",
    UPLOAD_IMAGE: "/common/upload",
  },
  live_endpoints: { LIVERATE: "https://api.unmarshal.com/v1/pricestore/chain" },
};

export default ApiEndpoints;
