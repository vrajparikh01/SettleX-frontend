import React, { useEffect, useState } from "react";
import Toggle from "../components/common/ToggleTabs";
import {
  ActiveIcon,
  EthLogo,
  GridIcon,
  HotSellingIcon,
  ListIcon,
  SearchIcon,
  ShuffleIcon,
  StableCoin,
  TrendingIcon,
} from "../assets/icons";
import OtcGrid from "../components/OtcGrid";
import OtcList from "../components/OtcList";
import SuccessModal from "../components/modal/SuccessModal";
import Banner from "../components/Otc/Banner";
import Dropdown from "../components/common/Dropdown";
import SellSummary from "../components/modal/SellSummary";
import BuySummary from "../components/modal/BuySummary";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { useAccount, useWriteContract } from "wagmi";
import { config, otc_contract } from "../config/contract.js";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import OtcAbi from "../contract/otcAbi.json";
import {
  getAllTrades,
  getTradeAnalytics,
  postActivity,
} from "../services/otc.js";
import NoTransaction from "../assets/images/NoTransaction.svg";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "../components/common/Pagination.jsx";
import { applyDebounce } from "../utils/index.js";

function Otc() {
  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();
  const account = useAccount();
  let [searchParams, setSearchParams] = useSearchParams();

  const tabs = [
    { label: "All", value: "all" },
    { label: "Buy", value: "buy" },
    { label: "Sell", value: "sell" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessages, setSuccessMessages] = useState({
    successText: "",
    descText: "",
  });
  const [buySummary, setBuySummary] = useState(false);
  const [sellSummary, setSellSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const tokenList = [
    { label: "Eth", value: "eth", logo: <EthLogo /> },
    { label: "Stable Coin", value: "usdc", logo: <StableCoin /> },
  ];
  const [selectedToken, setSelectedToken] = useState(tokenList[0]);
  const banners = [
    {
      icon: <ActiveIcon />,
      title: "Top Most Active",
      val: "mostActive",
    },
    {
      icon: <HotSellingIcon />,
      title: "Top Hot Selling",
      val: "hotSelling",
    },
    {
      icon: <TrendingIcon />,
      title: "Top Trending",
      val: "topTrending",
    },
  ];
  const [tradeList, setTradeList] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState({});
  const [topTrending, setTopTrending] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [hotSelling, setHotSelling] = useState([]);

  const [size, setSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);

  let debouncedDataget = applyDebounce(async (value) => {
    console.log("Here", value);
    getTrades(page, value);
  }, 1000);

  const handleInput = async (e) => {
    debouncedDataget(e.target.value);
  };

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

  function closeSuccessModal() {
    getTrades();
    setSuccessModal(false);
  }

  async function getTrades(page = 1, searchText = "") {
    try {
      if (searchParams?.get("type") == "all" || !searchParams?.get("type")) {
      }
      const tradeType = activeTab?.value; // Get the active tab value
      const val = await getAllTrades(
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

  async function getAnalytics() {
    try {
      const val = await getTradeAnalytics(account?.chainId);
      console.log("Ana", val);
      setTopTrending(val?.data?.data?.topTrending);
      setHotSelling(val?.data?.data?.hotSelling);
      setMostActive(val?.data?.data?.mostActive);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function handleBuyConfirmation(
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

  useEffect(() => {
    getAnalytics();
  }, [account?.chainId]);

  useEffect(() => {
    console.log("Here", activeTab.value);

    // Update the search params
    // const currentTradeType = searchParams.get("type");
    // if (currentTradeType) {
    //   setSearchParams("type", activeTab.value);
    // } else {
    //   setSearchParams("type", activeTab.value);
    // }
    getTrades();
  }, [activeTab, searchParams, account?.chainId]);

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
      <div className="flex flex-col flex-wrap md:flex-row gap-x-4 gap-y-4">
        {banners.map((item, index) => {
          return (
            <Banner
              key={index}
              className="flex-1"
              {...item}
              list={
                item?.val == "hotSelling"
                  ? hotSelling
                  : item?.val == "mostActive"
                  ? mostActive
                  : topTrending
              }
            />
          );
        })}
      </div>
      <div className="mt-4 md:mt-9">
        <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
          Fast Track
        </p>
        <div className="mt-4 md:mt-[10px] bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px]">
          <div className="flex flex-col gap-y-4 md:flex-row items-center justify-between p-[10px] md:p-5 pb-0 md:pb-[10px] md:border-b border-gray300 dark:border-gray300Dark">
            <div className="flex items-center gap-x-4 flex-col md:flex-row gap-y-1 md:w-[45%] w-full">
              <div className="bg-baseWhite dark:bg-black rounded-full py-[6px] pl-3 pr-[6px] flex justify-between items-center border border-gray300 dark:border-gray300Dark w-full">
                <input
                  placeholder="Send Amount"
                  type="number"
                  className="text-sm font-medium bg-transparent outline-none text-baseWhiteDark dark:text-baseWhite"
                />
                <Dropdown
                  items={tokenList}
                  selectedItem={selectedToken}
                  setSelectedItem={(selectedItem) => {
                    setSelectedToken(selectedItem);
                  }}
                  className={"!w-fit self-end"}
                  containerClassName={
                    "!p-[6px] !text-sm !font-medium !gap-x-1 !bg-transparent"
                  }
                  iconClassName={"!h-5 !w-5"}
                  searchable={true}
                />
              </div>
              <span className="hidden md:block">
                <ShuffleIcon />
              </span>
              <div className="bg-baseWhite dark:bg-black rounded-full py-[6px] pl-3 pr-[6px] flex justify-between items-center border border-gray300 dark:border-gray300Dark w-full">
                <input
                  placeholder="Get Up to Amount"
                  type="number"
                  className="text-sm font-medium bg-transparent outline-none text-baseWhiteDark dark:text-baseWhite"
                />
                <Dropdown
                  items={tokenList}
                  selectedItem={selectedToken}
                  setSelectedItem={(selectedItem) => {
                    setSelectedToken(selectedItem);
                  }}
                  className={"!w-fit self-end"}
                  containerClassName={
                    "!p-[6px] !text-sm !font-medium !gap-x-1 !bg-transparent"
                  }
                  iconClassName={"!h-5 !w-5"}
                  searchable={true}
                />
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-x-[10px] md:gap-x-4 w-full">
              <Toggle
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                className="!w-fit flex-none"
                variant="Connected"
              />
              <div className="hidden md:flex items-center bg-baseWhite dark:bg-black px-3 py-[10px] gap-x-5 rounded-full border border-gray300 dark:border-gray300Dark">
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    setIsGridView(true);
                  }}
                >
                  <GridIcon isActive={isGridView} />
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    setIsGridView(false);
                  }}
                >
                  <ListIcon isActive={!isGridView} />
                </span>
              </div>
              <div className="flex items-center px-3 py-[11.5px] w-[50%] md:w-[16vw] text-sm font-medium text-baseWhiteDark dark:text-baseWhite bg-baseWhite dark:bg-black border rounded-full outline-none gap-x-2 border-gray300 dark:border-gray300Dark">
                <span className="w-4 h-4">
                  <SearchIcon />
                </span>
                <input
                  className="text-sm leading-[19px] text-baseWhiteDark dark:text-baseWhite bg-transparent outline-none placeholder:text-gray500"
                  placeholder="Search"
                  onChange={(e) => {
                    handleInput(e);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex p-[10px] pt-4 md:p-5 md:pt-5">
            {isGridView ? (
              <div className="w-full">
                {tradeList && tradeList?.length ? (
                  <div className="w-full">
                    <div className="grid flex-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4">
                      {tradeList?.map((item, index) => {
                        return (
                          <OtcGrid
                            {...item}
                            key={index}
                            isBuy={item?.trade_type}
                            user_wallet={account?.address || ""}
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
                      It seems There is no trades were found. Please Refresh the
                      page for update the page
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1">
                <div className="grid items-center w-full grid-cols-6 px-5 py-5 text-sm font-medium text-gray500 dark:text-gray500Dark">
                  <p className="col-span-2">Offer</p>
                  <p className="">For</p>
                  <p className="">Views</p>
                  <p className="">Progress</p>
                  <p className="justify-self-end">Action</p>
                </div>
                <div className="flex flex-col gap-y-3">
                  {tradeList && tradeList?.length ? (
                    <div className="flex flex-col gap-y-3">
                      {tradeList.map((item, index) => {
                        return (
                          <OtcList
                            {...item}
                            key={index}
                            isBuy={item?.trade_type}
                            user_wallet={account?.address || ""}
                            onButtonClick={() => {
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
                        It seems There is no trades were found. Please Refresh
                        the page for update the page
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {successModal ? (
        <SuccessModal
          {...successMessages}
          closeModal={closeSuccessModal}
          handleViewOrder={() => {
            navigate(`/dashboard?tab=otc`);
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

export default Otc;
