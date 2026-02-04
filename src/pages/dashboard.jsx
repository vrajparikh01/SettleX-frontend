import React, { useEffect, useState } from "react";
import BuyModal from "../components/modal/BuyModal";
import BrokerModal from "../components/modal/BrokerModal";
import SuccessModal from "../components/modal/SuccessModal";
import SellModal from "../components/modal/SellModal";
import {
  EyeGrayIcon,
  Send1Icon,
  Send2Icon,
  TicketIcon,
  TrendingIcon,
  WalletIcon,
  WalletUpdateIcon,
} from "../assets/icons";
import { getTradeAnalytics, postTrade } from "../services/otc";
import { config, otc_contract, premarket_contract } from "../config/contract";
import OtcAbi from "../contract/otcAbi.json";
import PremarketABI from "../contract/premarketAbi.json";
import { useAccount, useWriteContract } from "wagmi";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { getQuickUpdates } from "../services/users";
import OptionModal from "../components/modal/OptionModal";
import { postPremarketTrade } from "../services/premarket";
import CreateSellOffer from "../components/Admin/CreateSellOffer";
import { generateLink } from "../services/broker";
import Toggle from "../components/common/ToggleTabs";
import OtcDashboard from "../components/Dashboard/OtcDashboard";
import BrokerDashboard from "../components/Dashboard/BrokerDashboard";
import PremarketDashboard from "../components/Dashboard/PremarketDashboard";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BrokerSuccessModal from "../components/modal/BrokerSuccessModal";

function Dashboard() {
  const { writeContractAsync } = useWriteContract();
  const { search } = useLocation();
  const navigate = useNavigate();
  const account = useAccount();
  const [brokerSuccessModal, setBrokerSuccessModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessages, setSuccessMessages] = useState({
    successText: "",
    descText: "",
  });
  const [buyModal, setBuyModal] = useState(false);
  const [sellModal, setSellModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topTrending, setTopTrending] = useState([]);
  const [quickUpdate, setQuickUpdate] = useState([]);

  const [modalOpen, setModalOpen] = useState({
    type: "",
    option: "",
  });
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [otcBrokerModal, setOtcBrokerModal] = useState(false);
  const [updatePremarketData, setUpdatePremarketData] = useState(false);
  const [updateOtcData, setUpdateOtcData] = useState(false);
  const [updateBrokerData, setUpdateBrokerData] = useState(false);

  const tabs = [
    { label: "Premarket", value: "premarket" },
    { label: "OTC", value: "otc" },
    { label: "OTC Broker", value: "broker" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const urlParams = new URLSearchParams(search);
  const queryTab = urlParams.get("tab");

  function handleCloseSuccessModal() {
    getUserUpdates();
    setSuccessModal(false);
  }

  async function getUserUpdates() {
    try {
      const val = await getQuickUpdates(account?.address);
      console.log("Heyyy", val);
      setQuickUpdate(val?.data?.data);
    } catch (err) {
      console.log("err", err);
    }
  }

  async function getAnalytics() {
    try {
      const val = await getTradeAnalytics(account?.chainId || "");
      console.log("Ana", val);
      setTopTrending(val?.data?.data?.topTrending);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function addTrade(trade) {
    try {
      console.log("Trade : call add trade : ", trade);
      const hash = await writeContractAsync({
        address: otc_contract(account?.chainId),
        abi: OtcAbi,
        functionName: "addTrade",
        args: [
          [
            parseUnits(trade?.offerToken.toString(), trade?.offerTokenDecimals), // Offer Token Count
            parseUnits(
              trade?.reciveToken.toString(),
              trade?.reciveTokenDecimals
            ), // Receive Token Count
            trade?.offer_token, // Offer Token Address
            trade?.receive_token, // Receive Token Address
            account?.address, // User Address
            trade?.lot_size, // Lot Tupe
            0, // Amount Sold
            0, // Status (0=Open,2=Closed)
            trade?.is_broker, // isBroker
            trade?.broker_fee, // BrokerFree
            trade?.receiver_wallet_address, // Recipent Address
            Date.now(), // Time Stamp
          ],
        ],
        onError: (error) => {
          console.log("Error while add trade called :", error);
        },
      });

      const value = await waitForTransactionReceipt(config, {
        hash: hash,
        chainId: account?.chainId,
        confirmations: 1,
      });

      if (hash && value) {
        return hash;
      }
      return false;
    } catch (error) {
      console.log("Error:: OtcDetails : callAddTrade ", error?.shortMessage);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed",
        errorMessage:
          error?.shortMessage.split(":")[1] ||
          error?.shortMessage ||
          "Error while creating the deal",
      });
    }
  }

  async function callApprove(
    numberOfToken,
    numberOfDecimal,
    tokenAddress,
    isPremarket = false
  ) {
    try {
      const approveContractHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          isPremarket
            ? premarket_contract(account?.chainId)
            : otc_contract(account?.chainId),
          parseUnits(numberOfToken.toString(), numberOfDecimal),
        ],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      const approveConfirmation = await waitForTransactionReceipt(config, {
        hash: approveContractHash,
        chainId: account?.chainId,
        confirmations: 1,
      });

      if (approveContractHash && approveConfirmation) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error:: OtcDetails", error?.shortMessage, error);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed",
        errorMessage:
          error?.shortMessage || "User did not approved the transaction",
      });
    }
  }

  async function checkBalance(
    totalRequiredBalance,
    numberOfDecimal,
    tokenAddress
  ) {
    console.log("Heyyy", totalRequiredBalance, numberOfDecimal, tokenAddress);
    try {
      const balance = await readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account?.address],
      });

      if (formatUnits(balance, numberOfDecimal) >= totalRequiredBalance) {
        return true;
      }
      console.log(
        "Number of decimal :",
        numberOfDecimal,
        "Balance:",
        formatUnits(balance, numberOfDecimal)
      );
      return false;
    } catch (error) {
      console.log("Error: Balance ", error);
    }
  }

  async function callGetLastAddedTradeIndex() {
    try {
      const index = await readContract(config, {
        address: otc_contract(account?.chainId),
        abi: OtcAbi,
        functionName: "getLastAddedTradeIndex",
        args: [account?.address],
      });

      console.log("Index:", Number(index));

      console.log("Index type :: ", typeof index);

      return Number(index);
    } catch (error) {
      console.log("Error:: Index", error);
    }
  }

  async function handleBuyOrderConfirmation(trade, receiveToken, offeredToken) {
    console.log("Data", trade, receiveToken, offeredToken);
    const offerToken =
      (trade?.total_token * trade?.price_per_token) / offeredToken?.price;
    const reciveToken = trade?.total_token;
    const reciveTokenDecimals = receiveToken?.number_of_decimals;
    const offerTokenDecimals = offeredToken?.number_of_decimals; // usdt,eth ...
    console.log(
      "Here also",
      offerToken,
      reciveToken,
      reciveTokenDecimals,
      offerTokenDecimals
    );
    handleOrderConfirmation(
      { ...trade, total_receive_token: offerToken },
      offerToken,
      reciveToken,
      reciveTokenDecimals,
      offerTokenDecimals
    );
  }

  async function handleSellOrderConfirmation(
    trade,
    receiveToken,
    offeredToken
  ) {
    console.log("Data", trade, receiveToken, offeredToken);
    const reciveToken =
      (trade?.total_token * trade?.price_per_token) / receiveToken?.price;
    const offerToken = trade?.total_token;
    const reciveTokenDecimals = receiveToken?.number_of_decimals;
    const offerTokenDecimals = offeredToken?.number_of_decimals; // usdt,eth ...
    console.log(
      "Here also",
      offerToken,
      reciveToken,
      reciveTokenDecimals,
      offerTokenDecimals
    );
    handleOrderConfirmation(
      { ...trade, total_receive_token: reciveToken },
      offerToken,
      reciveToken,
      reciveTokenDecimals,
      offerTokenDecimals
    );
  }

  async function handleOrderConfirmation(
    trade,
    offerToken,
    reciveToken,
    reciveTokenDecimals,
    offerTokenDecimals
  ) {
    setLoading(true);
    const isBalanceSufficient = await checkBalance(
      offerToken,
      offerTokenDecimals,
      trade?.offer_token
    );
    if (!isBalanceSufficient) {
      console.log("Err");
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: trade?.trade_type
          ? "Your buy order is failed due to insufficient balance"
          : "Your sell order is failed due to insufficient balance",
      });
      setSellModal(false);
      setBuyModal(false);
      setSuccessModal(true);
      return;
    }

    /// I will remove number_of_Decimals after using it in callAddTrade so, I can update the value accordingly
    const isApproved = await callApprove(
      offerToken,
      offerTokenDecimals,
      trade?.offer_token
    );
    if (!isApproved) {
      console.log("Err2");
      setLoading(false);
      setSellModal(false);
      setBuyModal(false);
      setSuccessModal(true);
      return;
    }
    const tradeToContract = {
      ...trade,
      offerToken,
      reciveToken,
      offerTokenDecimals,
      reciveTokenDecimals,
    };

    const addedTradeHash = await addTrade(tradeToContract);

    if (!addedTradeHash) {
      console.log("Err3");
      setLoading(false);
      setSellModal(false);
      setBuyModal(false);
      setSuccessModal(true);
      return;
    }

    const lastIndex = await callGetLastAddedTradeIndex(addedTradeHash);

    trade = {
      ...trade,
      trade_index_from_blockchain: lastIndex,
      trade_hash_from_blockchain: addedTradeHash,
      broker_link_id: "none",
    };

    try {
      console.log("Data", trade);
      const res = await postTrade(trade);
      console.log("ress", res);
      if (res) {
        if (activeTab?.value == "otc") {
          setUpdateOtcData(true); // update the data on dashboard
        }
        setLoading(false);
        setSuccessMessages({
          successText: "Success! Your Order is now Live!",
          descText: trade?.trade_type
            ? "Your buy order in now live on the OTC market."
            : "Your sell order in now live on the OTC market.",
          transactionHash: addedTradeHash,
        });
        setBuyModal(false);
        setSellModal(false);
        setSuccessModal(true);
      }
    } catch (err) {
      console.log("Error", err);
      setLoading(false);

      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: trade?.trade_type
          ? "Your buy order is failed"
          : "Your sell order is failed",
        errorMessage:
          err?.shortMessage?.split(":")[1] ||
          err?.shortMessage ||
          err?.message ||
          "",
      });
      setBuyModal(false);
      setSellModal(false);
      setSuccessModal(true);
      return;
    }
  }

  async function addPremarketTrade(trade) {
    try {
      console.log("Trade : call add trade : ", trade);
      const hash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "createOffer",
        args: [
          [
            // 1, //offer type
            modalOpen?.type == "sell" ? 1 : 0, // offer type
            trade?.offer_token, // Offer Token Address
            parseUnits(
              trade?.total_token.toString(),
              trade?.offerTokenDecimals
            ), // Offer Token Count
            trade?.receive_token, // Stable Token Address
            parseUnits(
              trade?.collateral_token_amount.toString(),
              trade?.reciveTokenDecimals
            ), // Stable Token Count
            trade?.receive_token, // Collateral Token Address
            parseUnits(
              trade?.collateral_token_amount.toString(),
              trade?.reciveTokenDecimals
            ), // Collateral Token Count
            account?.address, // User Address
            0, // Amount Sold
          ],
        ],
        onError: (error) => {
          console.log("Error while add trade called :", error);
        },
      });

      const value = await waitForTransactionReceipt(config, {
        hash: hash,
        chainId: account?.chainId,
        confirmations: 1,
      });

      if (hash && value) {
        return hash;
      }
      return false;
    } catch (error) {
      console.log("Error:: OtcDetails : callAddTrade ", error);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed",
        errorMessage:
          err?.shortMessage?.split(":")[1] ||
          err?.message ||
          "Error while creating the deal",
      });
    }
  }

  async function callPremarketLastAddedTradeIndex() {
    try {
      const index = await readContract(config, {
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "getLastAddedOfferIndex",
        args: [account?.address],
      });

      console.log("Index:", Number(index));
      console.log("Index type :: ", typeof index);

      return Number(index);
    } catch (error) {
      console.log("Error:: Index", error);
    }
  }

  function handleViewOrder() {
    if (modalOpen?.option == "otc") {
      navigate("/dashboard?tab=otc");
    } else if (modalOpen?.option == "premarket") {
      navigate("/dashboard?tab=premarket");
    } else if (modalOpen?.option == "otcBroker") {
      navigate("/dashboard?tab=broker");
    }
  }

  function handleNextBtnClick(selectedOption) {
    console.log("Sell Modal", selectedOption);
    setModalOpen({ ...modalOpen, option: selectedOption });
    setIsOptionModalOpen(false);
    if (selectedOption == "otc") {
      if (modalOpen?.type == "buy") {
        setBuyModal(true);
      } else if (modalOpen?.type == "sell") {
        setSellModal(true);
      }
    } else if (selectedOption == "premarket") {
      setCreateModal(true);
    } else if (selectedOption == "otcBroker") {
      setOtcBrokerModal(true);
    }
  }

  async function handlePremarketOrderConfirmation({
    priceOfferToken,
    offerToken,
    selectedToken,
    selectedCollateralToken,
    numberOfCollateralToken,
  }) {
    console.log(
      "hereeee",
      selectedToken,
      numberOfCollateralToken,
      selectedCollateralToken,
      offerToken,
      priceOfferToken
    );
    const trade = {
      offer_token: selectedToken?.token_address,
      receive_token: selectedCollateralToken?.token_address,
      total_token: offerToken,
      price_per_token: priceOfferToken,
      chain_id: account?.chainId,
      wallet_address: account?.address,
      collateral_token_amount: numberOfCollateralToken,
      trade_type: modalOpen?.type == "sell" ? 0 : 1, // 0=>Sell, 1=>Buy
    };
    console.log("tradeeee", trade);
    const reciveTokenDecimals = selectedCollateralToken?.number_of_decimals;
    const offerTokenDecimals = selectedToken?.number_of_decimals; // usdt,eth ...
    setLoading(true);
    const isBalanceSufficient = await checkBalance(
      trade?.collateral_token_amount,
      selectedCollateralToken?.number_of_decimals,
      selectedCollateralToken?.token_address
    );
    if (!isBalanceSufficient) {
      console.log("Err");
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed due to insufficient balance",
      });
      setCreateModal(false);
      setSuccessModal(true);
      return;
    }

    const isApproved = await callApprove(
      trade?.collateral_token_amount,
      selectedCollateralToken?.number_of_decimals,
      selectedCollateralToken?.token_address,
      true // ispremarket
    );
    if (!isApproved) {
      console.log("Err2");
      setLoading(false);
      setCreateModal(false);
      setSuccessModal(true);
      return;
    }
    const tradeToContract = {
      ...trade,
      offerTokenDecimals,
      reciveTokenDecimals,
    };

    const addedTradeHash = await addPremarketTrade(tradeToContract);

    if (!addedTradeHash) {
      console.log("Err3");
      setLoading(false);
      setCreateModal(false);
      setSuccessModal(true);
      return;
    }

    const lastIndex = await callPremarketLastAddedTradeIndex();

    const finalTrade = {
      ...trade,
      trade_index_from_blockchain: lastIndex,
      trade_hash_from_blockchain: addedTradeHash,
    };

    try {
      console.log("Data", finalTrade);
      const res = await postPremarketTrade(finalTrade);
      console.log("ress", res);
      if (res) {
        if (activeTab?.value == "premarket") {
          setUpdatePremarketData(true);
        }
        setLoading(false);
        setSuccessMessages({
          successText: "Success! Your Order is now Live!",
          descText: "Your order in now live on the Premarket.",
          transactionHash: addedTradeHash,
        });
        setCreateModal(false);
        setSuccessModal(true);
      }
    } catch (err) {
      console.log("Error", err);
      setLoading(false);

      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed",
        errorMessage:
          err?.shortMessage?.split(":")[1] ||
          err?.shortMessage ||
          err?.message ||
          "",
      });
      setCreateModal(false);
      setSuccessModal(true);
      return;
    }
  }

  async function handleGenerateLink(data) {
    try {
      console.log("heyy check", data);
      const res = await generateLink(data);
      console.log("ress", res);
      navigator.clipboard.writeText(
        window?.location?.origin + "/deal-approval?id=" + res?.data?.data?.id
      );
      setOtcBrokerModal(false);
      if (activeTab?.value == "broker") {
        setUpdateBrokerData(true);
      }
      setBrokerSuccessModal(true);
    } catch (err) {
      console.log("Errr", err);
      toast.error("Error while generating link");
    }
  }

  useEffect(() => {
    getAnalytics();
  }, [account?.chainId]);

  useEffect(() => {
    if (account?.address) {
      getUserUpdates();
    } else {
      setQuickUpdate([]);
    }
  }, [account?.address]);

  useEffect(() => {
    console.log("search", search);
    // This will update the tab if the query parameter changes
    if (queryTab !== activeTab.value) {
      const updatedTab = tabs.find((tab) => tab.value === queryTab);
      if (updatedTab) {
        setActiveTab(updatedTab);
      }
    }
  }, [search]);

  return (
    <div className="px-5 py-4 md:px-8">
      <div className="flex flex-col md:flex-row gap-x-5">
        <div className="flex flex-col w-full md:w-[60%]">
          <Toggle
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            className="!w-fit flex-none"
            variant="Connected"
          />
          {activeTab?.value == "premarket" ? (
            <PremarketDashboard
              updatePremarketData={updatePremarketData}
              setUpdatePremarketData={setUpdatePremarketData}
            />
          ) : activeTab?.value == "otc" ? (
            <OtcDashboard
              updateOtcData={updateOtcData}
              setUpdateOtcData={setUpdateOtcData}
            />
          ) : (
            <BrokerDashboard
              updateBrokerData={updateBrokerData}
              setUpdateBrokerData={setUpdateBrokerData}
            />
          )}
        </div>
        <div className="w-full md:w-[40%] mt-[10px] md:mt-0">
          <p className="pb-[10px] md:pb-3 text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
            Hot Favorites
          </p>
          <div className="bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] mb-[10px] md:mb-[14px]">
            <p className="font-semibold text-sm text-gray500 dark:text-gray500Dark flex items-center gap-x-[6px] mb-2 md:mb-4">
              <span>
                <TrendingIcon />
              </span>
              Trending
            </p>
            <div className="flex flex-col md:flex-row items-center gap-y-[10px]">
              {topTrending && topTrending?.length ? (
                topTrending.map((item, index) => {
                  return (
                    <div
                      className="flex items-center flex-1 w-full md:w-fit gap-x-2"
                      key={index}
                    >
                      <img
                        src={item?.token_image}
                        alt="logo"
                        className="w-8 h-8"
                      />
                      <div className="flex flex-row justify-between w-full md:w-fit md:justify-normal md:flex-col">
                        <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                          {item?.name}
                        </p>
                        <p className="flex items-center text-sm font-medium gap-x-1 text-gray500 dark:text-gray500Dark">
                          <span className="w-4 h-4">
                            <EyeGrayIcon />
                          </span>
                          {item?.view_counts || 0}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-3 text-base font-medium bg-gray100 dark:bg-gray100Dark rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
                  <p className="w-full text-center">No Data</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row w-full items-center gap-x-4 gap-y-[10px]">
            <button
              className="flex-1 flex flex-row md:flex-col justify-center items-center w-full gap-x-[10px] gap-y-[10px] py-3 border border-theme-green bg-gray100 dark:bg-gray100Dark rounded-[14px]"
              onClick={() => {
                setIsOptionModalOpen(true);
                setModalOpen({ ...modalOpen, type: "buy" });
              }}
            >
              <span>
                <WalletIcon />
              </span>
              <p className="text-sm font-semibold text-theme-green">
                Create Buy Request
              </p>
            </button>
            <button
              className="flex-1 flex flex-row md:flex-col justify-center items-center w-full gap-x-[10px] gap-y-[10px] py-3 border border-theme-green bg-gray100 dark:bg-gray100Dark rounded-[14px]"
              onClick={() => {
                setIsOptionModalOpen(true);
                setModalOpen({ ...modalOpen, type: "sell" });
              }}
            >
              <span>
                <Send2Icon />
              </span>
              <p className="text-sm font-semibold text-theme-green">
                Create Sell Request
              </p>
            </button>
          </div>
          <p className="mt-[10px] md:mt-5 mb-[10px] text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
            Quick Updates
          </p>
          <div className="bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark p-[10px] md:p-4 rounded-[14px]">
            <div className="flex gap-x-[10px] pb-4 border-b border-gray300 dark:border-gray300Dark">
              <div className="p-[10px] bg-primary100 dark:bg-primary100Dark w-fit h-fit rounded-lg">
                <WalletUpdateIcon />
              </div>
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
                    Transaction Update
                  </p>
                  {/* <p className="text-gray500 dark:text-gray500Dark font-medium text-[10px] leading-[14px]">
                    12:34 PM
                  </p> */}
                </div>
                <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                  {quickUpdate?.[0]?.message || "-"}
                </p>
              </div>
            </div>
            <div className="flex gap-x-[10px] py-4 border-b border-gray300 dark:border-gray300Dark">
              <div className="p-[10px] bg-success100 dark:bg-success100Dark w-fit h-fit rounded-lg">
                <TicketIcon />
              </div>
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
                    New Offer Arrived
                  </p>
                </div>
                <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                  {quickUpdate?.[1]?.message || "-"}
                </p>
              </div>
            </div>
            <div className="flex gap-x-[10px] pt-4">
              <div className="p-[10px] bg-blue300Dark dark:bg-blue300 w-fit h-fit rounded-lg">
                <Send1Icon />
              </div>
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
                    Contributed Successfully
                  </p>
                </div>
                <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                  {quickUpdate?.[2]?.message || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {buyModal ? (
        <BuyModal
          closeModal={() => {
            setBuyModal(false);
          }}
          onConfirmClick={handleBuyOrderConfirmation}
          loading={loading}
        />
      ) : (
        <></>
      )}
      {sellModal ? (
        <SellModal
          closeModal={() => {
            setSellModal(false);
          }}
          onConfirmClick={handleSellOrderConfirmation}
          loading={loading}
        />
      ) : (
        <></>
      )}
      {createModal ? (
        <CreateSellOffer
          closeModal={() => {
            setCreateModal(false);
          }}
          onConfirmClick={handlePremarketOrderConfirmation}
          isSell={modalOpen?.type == "sell"}
          loading={loading}
        />
      ) : (
        <></>
      )}
      {otcBrokerModal ? (
        <BrokerModal
          closeModal={() => {
            setOtcBrokerModal(false);
          }}
          onConfirmClick={handleGenerateLink}
          isSell={modalOpen?.type == "sell"}
          loading={loading}
        />
      ) : (
        <></>
      )}
      {successModal ? (
        <SuccessModal
          {...successMessages}
          closeModal={handleCloseSuccessModal}
          handleViewOrder={handleViewOrder}
        />
      ) : (
        <></>
      )}
      {brokerSuccessModal ? (
        <BrokerSuccessModal
          closeModal={() => {
            setBrokerSuccessModal(false);
          }}
          handleViewOrder={() => {
            navigate("/dashboard?tab=broker");
            setBrokerSuccessModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {isOptionModalOpen ? (
        <OptionModal
          handleNextBtnClick={handleNextBtnClick}
          closeModal={() => {
            setModalOpen({
              type: "",
              option: "",
            });
            setIsOptionModalOpen(false);
          }}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Dashboard;
