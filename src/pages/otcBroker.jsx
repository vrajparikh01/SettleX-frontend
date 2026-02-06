import React, { useEffect, useState } from "react";
import BrokerCardGrid from "../components/Broker/BrokerCardGrid";
import { SearchIcon } from "../assets/icons";
import Toggle from "../components/common/ToggleTabs";
import { getAllBrokerTrades, postActivity } from "../services/otc";
import OtcGrid from "../components/OtcGrid";
import SellSummary from "../components/modal/SellSummary";
import BuySummary from "../components/modal/BuySummary";
import Pagination from "../components/common/Pagination";
import { useAccount, useWriteContract } from "wagmi";
import { applyDebounce } from "../utils/index.js";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { config, otc_contract } from "../config/contract.js";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import SuccessModal from "../components/modal/SuccessModal.jsx";
import OtcAbi from "../contract/otcAbi.json";
import NoTransaction from "../assets/images/NoTransaction.svg";
import { useNavigate } from "react-router-dom";

function OtcBroker() {
  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();
  const account = useAccount();
  const tabs = [
    { label: "All", value: "all" },
    { label: "Buy", value: "buy" },
    { label: "Sell", value: "sell" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [size, setSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [tradeList, setTradeList] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState({});
  const [successModal, setSuccessModal] = useState(false);
  const [successMessages, setSuccessMessages] = useState({
    successText: "",
    descText: "",
  });
  const [buySummary, setBuySummary] = useState(false);
  const [sellSummary, setSellSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  let debouncedDataget = applyDebounce(async (value) => {
    console.log("Here", value);
    getTrades(page, value);
  }, 1000);

  const handleInput = async (e) => {
    debouncedDataget(e.target.value);
  };

  async function getTrades(page = 1, searchText = "") {
    try {
      const tradeType = activeTab?.value; // Get the active tab value
      const val = await getAllBrokerTrades(
        page,
        tradeType,
        searchText,
        account?.chainId || ""
      );
      console.log("Vall", val);
      setTradeList(val?.data?.data?.trades);
      setSize(val?.data?.data?.trades?.length);
      setTotalPages(
        Math.floor(val?.data?.data?.totalTrades / 10) +
          (val?.data?.data?.totalTrades % 10 !== 0)
      );
      setTotalTokens(val?.data?.data?.totalTrades);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function callApprove(numberOfToken, numberOfDecimal, tokenAddress) {
    try {
      const approveContractHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          otc_contract(account?.chainId),
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
      console.log("Error:: Approval ", error);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed",
        errorMessage:
          error?.shortMessage || "User did not approved the transaction",
      });
    }
  }

  async function executeTrade(
    index,
    offerAmount,
    receivingAmount,
    offerTokenDecimals,
    receiveTokenDecimals
  ) {
    try {
      const hash = await writeContractAsync({
        address: otc_contract(account?.chainId),
        abi: OtcAbi,
        functionName: "executeTrade",
        args: [
          index,
          parseUnits(offerAmount.toString(), offerTokenDecimals), // Offer Token Count
          parseUnits(receivingAmount.toString(), receiveTokenDecimals), // Receive Token Count
        ],
        // args: [index, offerAmount, receivingAmount],
        onError: (error) => {
          console.log("Error:: OtcDetails : callAddActivity ", error);
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
      console.log("Error:: OtcDetails : callAddActivity ", error);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed",
        errorMessage:
          error?.shortMessage.split(":")[1] ||
          error?.shortMessage ||
          "Error while executing the deal",
      });
    }
  }

  async function checkBalance(
    totalRequiredBalance,
    numberOfDecimal,
    tokenAddress
  ) {
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
      console.log("Error:: OtcDetails : Checkbalance ", error);
    }
  }

  async function handleBuyConfirmation(
    numberOfTokenByUser,
    collateralTokenCount
  ) {
    setLoading(true);
    const numberOfTokens = numberOfTokenByUser;
    const isBalanceSufficient = await checkBalance(
      collateralTokenCount,
      selectedTrade?.receive_token?.number_of_decimals,
      selectedTrade?.receive_token?.token_address
    );
    if (!isBalanceSufficient) {
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: selectedTrade?.trade_type
          ? "Your buy order is failed due to insufficient balance"
          : "Your sell order is failed due to insufficient balance",
      });
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const isApproved = await callApprove(
      collateralTokenCount,
      selectedTrade?.receive_token?.number_of_decimals,
      selectedTrade?.receive_token?.token_address
    );

    if (!isApproved) {
      setLoading(false);
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const addedActivityHash = await executeTrade(
      selectedTrade?.trade_index_from_blockchain,
      numberOfTokenByUser,
      collateralTokenCount,
      selectedTrade?.offer_token?.number_of_decimals,
      selectedTrade?.receive_token?.number_of_decimals
    );

    if (!addedActivityHash) {
      setLoading(false);
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const val = {
      trade_id: selectedTrade?._id,
      number_of_token: numberOfTokenByUser,
      number_of_token_received: collateralTokenCount,
      price_per_token: selectedTrade?.price_per_token,
      activity_type: 1,
      transaction_hash: addedActivityHash,
      from_address: selectedTrade?.receiver_wallet_address,
      to_address: account?.address,
      current_wallet_address: account?.address,
      chain_id: account?.chainId,
    };
    try {
      const res = await postActivity(val);
      if (res) {
        setSuccessMessages({
          successText: "Success!",
          descText: "Your buy order in successfully executed.",
          transactionHash: addedActivityHash,
        });
        setLoading(false);
        setBuySummary(false);
        setSuccessModal(true);
      }
    } catch (err) {
      console.log("Error", err);
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: selectedTrade?.trade_type
          ? "Your buy order is failed"
          : "Your sell order is failed",
        errorMessage:
          err?.shortMessage?.split(":")[1] ||
          err?.shortMessage ||
          err?.message ||
          "",
      });
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
    }
  }

  async function handleSellConfirmation(
    numberOfTokenByUser,
    collateralTokenCount
  ) {
    setLoading(true);
    const numberOfTokens = numberOfTokenByUser;
    console.log(
      "Selected",
      selectedTrade,
      numberOfTokens,
      collateralTokenCount
    );
    const isBalanceSufficient = await checkBalance(
      numberOfTokens,
      selectedTrade?.offer_token?.number_of_decimals,
      selectedTrade?.offer_token?.token_address
    );
    if (!isBalanceSufficient) {
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: selectedTrade?.trade_type
          ? "Your buy order is failed due to insufficient balance"
          : "Your sell order is failed due to insufficient balance",
      });
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const isApproved = await callApprove(
      numberOfTokens,
      selectedTrade?.offer_token?.number_of_decimals,
      selectedTrade?.offer_token?.token_address
    );

    if (!isApproved) {
      setLoading(false);
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const addedActivityHash = await executeTrade(
      selectedTrade?.trade_index_from_blockchain,
      collateralTokenCount,
      numberOfTokenByUser,
      selectedTrade?.receive_token?.number_of_decimals,
      selectedTrade?.offer_token?.number_of_decimals
    );

    if (!addedActivityHash) {
      setLoading(false);
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const val = {
      trade_id: selectedTrade?._id,
      number_of_token: numberOfTokenByUser,
      number_of_token_received: collateralTokenCount,
      price_per_token: selectedTrade?.price_per_token,
      activity_type: 0,
      transaction_hash: addedActivityHash,
      from_address: selectedTrade?.receiver_wallet_address,
      to_address: account?.address,
      current_wallet_address: account?.address,
      chain_id: account?.chainId,
    };
    console.log("Heyy", val);
    try {
      const res = await postActivity(val);
      if (res) {
        setSuccessMessages({
          successText: "Success!",
          descText: "Your sell order in successfully executed.",
          transactionHash: addedActivityHash,
        });
        setLoading(false);
        setSellSummary(false);
        setSuccessModal(true);
      }
    } catch (err) {
      console.log("Err");
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: selectedTrade?.trade_type
          ? "Your buy order is failed"
          : "Your sell order is failed",
        errorMessage:
          err?.shortMessage?.split(":")[1] ||
          err?.shortMessage ||
          err?.message ||
          "",
      });
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
    }
  }

  function closeSuccessModal() {
    getTrades();
    setSuccessModal(false);
  }

  useEffect(() => {
    console.log("Here", activeTab.value);
    getTrades();
  }, [activeTab, account?.chainId]);

  const goToPage = async (page) => {
    setPage(page);
    await getTrades(page);
  };

  const handleNextPage = async () => {
    setPage((prev) => prev + 1);
    await getTrades(page + 1);
  };

  const handlePrevPage = async () => {
    setPage((prev) => prev - 1);
    await getTrades(page - 1);
  };
  return (
    <div className="px-5 py-4 md:px-8">
      <div className="px-[10px] py-[10px] md:px-5 md:py-3 border bg-gray100 dark:bg-gray100Dark border-gray200 dark:border-gray200Dark rounded-[14px]">
        <p className="text-2xl md:text-[28px] md:leading-9 font-semibold text-baseWhiteDark dark:text-baseWhite">
          Find your ideal offer via SettleX Global Crypto Brokers
        </p>
        <p className="md-[10px] md:mt-[6px] text-base font-medium text-gray500 dark:text-gray500Dark">
          Our brokers platform only offering large ticket size deals
        </p>
      </div>
      <div className="mt-5 px-[10px] py-[10px] md:px-5 md:py-3 border bg-gray100 dark:bg-gray100Dark border-gray200 dark:border-gray200Dark rounded-[14px]">
        <div className="flex items-center justify-between md:pb-4 md:border-b gap-x-4 border-gray300 dark:border-gray300Dark">
          <Toggle
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            className="!w-fit flex-none"
            variant="Connected"
          />
          <div className="flex items-center px-3 py-[11.5px] w-full md:w-[16vw] text-sm font-medium text-baseWhiteDark dark:text-baseWhite bg-baseWhite dark:bg-black border rounded-full outline-none gap-x-2 border-gray300 dark:border-gray300Dark">
            <span className="w-4 h-4">
              <SearchIcon />
            </span>
            <input
              className="text-sm leading-[19px] text-baseWhiteDark dark:text-baseWhite bg-transparent outline-none placeholder:text-gray500 w-full"
              placeholder="Search"
              onChange={(e) => {
                handleInput(e);
              }}
            />
          </div>
        </div>
        {tradeList && tradeList?.length ? (
          <div className="w-full">
            <div className="grid flex-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4 mt-[10px] md:mt-4">
              {tradeList?.map((item, index) => {
                return (
                  <OtcGrid
                    {...item}
                    key={index}
                    isBuy={item?.trade_type}
                    onButtonClick={() => {
                      console.log("Item", item);
                      setSelectedTrade(item);
                      if (item?.trade_type) {
                        setBuySummary(true);
                      } else {
                        setSellSummary(true);
                      }
                    }}
                  />
                );
              })}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                size={size}
                totalResults={totalTokens}
                totalPages={totalPages}
                goToPage={goToPage}
                handleNextPage={handleNextPage}
                handlePrevPage={handlePrevPage}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
            <img src={NoTransaction} alt="no transactions" />
            <p className="w-full px-10 text-center md:w-1/2">
              It seems There is no trades were found. Please Refresh the page
              for update the page
            </p>
          </div>
        )}
      </div>
      {successModal ? (
        <SuccessModal
          {...successMessages}
          closeModal={closeSuccessModal}
          handleViewOrder={() => {
            navigate(`/dashboard?tab=broker`);
          }}
        />
      ) : (
        <></>
      )}
      {buySummary ? (
        <BuySummary
          closeModal={() => {
            setBuySummary(false);
          }}
          onConfirmClick={handleBuyConfirmation}
          loading={loading}
          {...selectedTrade}
        />
      ) : (
        <></>
      )}
      {sellSummary ? (
        <SellSummary
          closeModal={() => {
            setSellSummary(false);
          }}
          onConfirmClick={handleSellConfirmation}
          loading={loading}
          {...selectedTrade}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default OtcBroker;
