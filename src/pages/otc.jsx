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
import { useEnsResolver, useEnsReputationScore, isValidEnsName } from "../hooks/useEns";
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

  // A3: ENS-only filter toggle
  const [ensOnlyFilter, setEnsOnlyFilter] = useState(false);
  // A7: ENS name search — separate from token name search
  const [searchValue, setSearchValue] = useState("");
  const isEnsSearch = isValidEnsName(searchValue);
  // A7: Resolve typed ENS name to address for client-side filtering
  const { address: ensSearchAddress, isLoading: ensSearchLoading } = useEnsResolver(
    isEnsSearch ? searchValue : null
  );
  // A8: Read current user's settlex.prefs to highlight matching trades
  const { prefs: myPrefs } = useEnsReputationScore(account?.address);

  let debouncedDataget = applyDebounce(async (value) => {
    // A7: If input is an ENS name, don't send to API — filter client-side instead
    if (!isValidEnsName(value)) {
      getTrades(page, value);
    }
  }, 1000);

  const handleInput = async (e) => {
    const val = e.target.value;
    setSearchValue(val);
    debouncedDataget(val);
  };

  // A7: Client-side filtered list when searching by ENS name
  const displayedTrades = isEnsSearch && ensSearchAddress
    ? (tradeList || []).filter(
        (t) => t.receiver_wallet_address?.toLowerCase() === ensSearchAddress.toLowerCase()
      )
    : tradeList;

  // A8: Check if a trade matches the logged-in user's ENS token preferences
  const matchesPref = (trade) => {
    if (!myPrefs?.tokens?.length) return false;
    const tokens = myPrefs.tokens.map((t) => t.toUpperCase());
    return (
      tokens.includes(trade.offer_token?.symbol?.toUpperCase()) ||
      tokens.includes(trade.receive_token?.symbol?.toUpperCase())
    );
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
              {/* A7: Search accepts ENS names (alice.eth) or token names */}
              <div className={`flex items-center px-3 py-[11.5px] w-[50%] md:w-[16vw] text-sm font-medium text-baseWhiteDark dark:text-baseWhite bg-baseWhite dark:bg-black border rounded-full outline-none gap-x-2 transition-colors ${
                isEnsSearch
                  ? ensSearchLoading
                    ? "border-primary1000 animate-pulse"
                    : ensSearchAddress
                    ? "border-emerald-500"
                    : "border-red-400"
                  : "border-gray300 dark:border-gray300Dark"
              }`}>
                <span className="w-4 h-4 flex-shrink-0">
                  <SearchIcon />
                </span>
                <input
                  className="text-sm leading-[19px] text-baseWhiteDark dark:text-baseWhite bg-transparent outline-none placeholder:text-gray500 w-full"
                  placeholder="Search or alice.eth"
                  onChange={handleInput}
                />
              </div>
              {/* A3: ENS-only filter toggle */}
              <button
                onClick={() => setEnsOnlyFilter((v) => !v)}
                className={`hidden md:flex items-center gap-x-[6px] px-3 py-[10px] rounded-full border text-xs font-semibold transition-all ${
                  ensOnlyFilter
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                    : "bg-baseWhite dark:bg-black border-gray300 dark:border-gray300Dark text-gray500 dark:text-gray500Dark"
                }`}
                title="Show only traders with ENS names"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                ENS only
              </button>
            </div>
          </div>
          <div className="flex p-[10px] pt-4 md:p-5 md:pt-5">
            {isGridView ? (
              <div className="w-full">
                {/* A7: show ENS search status */}
                {isEnsSearch && (
                  <p className="text-xs text-gray500 dark:text-gray500Dark mb-3 px-1">
                    {ensSearchLoading ? "Resolving ENS name…" : ensSearchAddress
                      ? `Showing trades by ${searchValue} (${ensSearchAddress.substring(0, 8)}…)`
                      : `No ENS name found for "${searchValue}"`}
                  </p>
                )}
                {/* A8: show preference match hint */}
                {myPrefs?.tokens?.length > 0 && (
                  <p className="text-xs text-emerald-500 mb-3 px-1 flex items-center gap-x-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
                    Green border = matches your ENS preferences ({myPrefs.tokens.join(", ")})
                  </p>
                )}
                {displayedTrades && displayedTrades?.length ? (
                  <div className="w-full">
                    <div className="grid flex-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4">
                      {displayedTrades?.map((item, index) => {
                        return (
                          <OtcGrid
                            {...item}
                            key={index}
                            isBuy={item?.trade_type}
                            user_wallet={account?.address || ""}
                            hideIfNoEns={ensOnlyFilter}
                            highlightMatch={matchesPref(item)}
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
                  {displayedTrades && displayedTrades?.length ? (
                    <div className="flex flex-col gap-y-3">
                      {displayedTrades.map((item, index) => {
                        return (
                          <OtcList
                            {...item}
                            key={index}
                            isBuy={item?.trade_type}
                            user_wallet={account?.address || ""}
                            hideIfNoEns={ensOnlyFilter}
                            highlightMatch={matchesPref(item)}
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
