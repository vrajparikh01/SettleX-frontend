import React, { useEffect, useState } from "react";
import {
  DropdownArrow,
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
} from "../assets/icons";
import SuccessModal from "../components/modal/SuccessModal";
import DealGridView from "../components/Premarket/DealGridView";
import DealTableView from "../components/Premarket/DealTableView";
import SingleBanner from "../components/Premarket/SingleBanner";
import LavaLogo from "../assets/images/LavaLogo.png";
import BuySummary from "../components/modal/BuySummary";
import {
  getAllPremarketTrade,
  getPremarketTrade,
  postPremarketActivity,
} from "../services/premarket";
import Pagination from "../components/common/Pagination";
import { useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import PremarketAbi from "../contract/premarketAbi.json";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { config, premarket_contract } from "../config/contract";
import SellSummary from "../components/modal/SellSummary";
import Toggle from "../components/common/ToggleTabs";
import NoTransaction from "../assets/images/NoTransaction.svg";
import { useNavigate } from "react-router-dom";

function Premarket() {
  const navigate = useNavigate();
  const { writeContractAsync } = useWriteContract();
  const account = useAccount();
  const [successModal, setSuccessModal] = useState(false);
  const [successMessages, setSuccessMessages] = useState({
    successText: "",
    descText: "",
  });
  const [isGridView, setIsGridView] = useState(true);
  const [buySummary, setBuySummary] = useState(false);
  const [sellSummary, setSellSummary] = useState(false);

  const [tradeList, setTradeList] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState({});

  const [size, setSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { label: "All", value: "all" },
    { label: "Buy", value: "buy" },
    { label: "Sell", value: "sell" },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const banners = [
    {
      icon: "https://dropsearn.fra1.cdn.digitaloceanspaces.com/static/cache/c1/ae/c1ae0fe3692014be6ee12de3c977ff73.webp",
      title: "Berachain",
      view: 4152,
      iconTheme: "#012E0F",
    },
    {
      icon: "https://dropsearn.fra1.cdn.digitaloceanspaces.com/static/cache/02/cb/02cb7cf282bda2ac3c0c5fa0c606b2b9.webp",
      title: "Babylon",
      view: 4152,
      iconTheme: "#03111C",
    },
    {
      icon: "https://dropsearn.fra1.cdn.digitaloceanspaces.com/static/cache/35/11/3511e07bc97e43bb93e5f387b553e7a8.webp",
      title: "Symbiotic",
      view: 4152,
      iconTheme: "#F20176",
    },
    {
      icon: "https://dropsearn.fra1.cdn.digitaloceanspaces.com/static/cache/d6/bd/d6bdba24d30ce698279771160266e963.webp",
      title: "Solanex AI",
      view: 4152,
      iconTheme: "#110000",
    },
  ];

  async function getTrades(page = 1, searchText = "") {
    try {
      const tradeType = activeTab?.value; // Get the active tab value
      const val = await getAllPremarketTrade(
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

  async function callApprove(numberOfToken, numberOfDecimal, tokenAddress) {
    try {
      const approveContractHash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          premarket_contract(account?.chainId),
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
      console.log("Error:: Approval", error);
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
        address: premarket_contract(account?.chainId),
        abi: PremarketAbi,
        functionName: "contributeToOffer",
        args: [
          index,
          parseUnits(receivingAmount.toString(), receiveTokenDecimals), // collateral Token Count
          parseUnits(offerAmount.toString(), offerTokenDecimals), // offer Token Count
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
        descText: "Your order is failed due to insufficient balance",
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
      price_per_token: selectedTrade?.price_per_token,
      transaction_hash: addedActivityHash,
      from_address: selectedTrade?.deal_creator_address,
      to_address: account?.address,
      current_wallet_address: account?.address,
      chain_id: account?.chainId,
      invest_token_amount: numberOfTokenByUser,
      claim_token_amount: collateralTokenCount,
    };
    try {
      const res = await postPremarketActivity(val);
      if (res) {
        setSuccessMessages({
          successText: "Success!",
          descText: "Your order in successfully executed.",
          transactionHash: addedActivityHash,
        });
        setLoading(false);
        setBuySummary(false);
        setSellSummary(false);
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

  useEffect(() => {
    getTrades();
  }, [activeTab, account?.chainId]);

  return (
    <div className="px-5 py-4 md:px-8">
      <div className="flex flex-wrap gap-x-4 gap-y-4">
        {banners.map((item, index) => {
          return (
            <SingleBanner
              key={index}
              className="flex-1"
              index={index % 4}
              {...item}
            />
          );
        })}
      </div>
      <div className="mt-5">
        <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
          Live Deals
        </p>
        <div className="mt-[10px] border border-gray200 dark:border-gray200Dark bg-gray100 dark:bg-gray100Dark rounded-[14px]">
          <div className="flex items-center justify-between flex-1 p-[10px] md:p-5 pb-4 md:border-b gap-x-4 border-gray300 dark:border-gray300Dark">
            <Toggle
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              className="!w-fit flex-none"
              variant="Connected"
            />
            <div className="flex items-center gap-x-[10px]">
              <div className="hidden md:flex items-center bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark px-3 py-[10px] gap-x-5 rounded-full">
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
              <div className="flex items-center px-3 py-[11.5px] w-full md:w-[20vw] text-sm font-medium text-baseWhiteDark dark:text-baseWhite bg-baseWhite dark:bg-black border rounded-full outline-none gap-x-2 border-gray300 dark:border-gray300Dark">
                <span>
                  <SearchIcon />
                </span>
                <input
                  className="bg-transparent outline-none text-baseWhiteDark dark:text-baseWhite placeholder:text-gray500"
                  placeholder="Search"
                />
              </div>
              {/* <button className="flex items-center gap-x-[10px] bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark py-[10px] px-3 rounded-full">
                <span>
                  <FilterIcon />
                </span>
                <p className="hidden text-sm font-medium md:block text-gray500 dark:text-gray500Dark">
                  Filter
                </p>
                <span className="hidden md:block">
                  <DropdownArrow stroke={"stroke-[#828282]"} />
                </span>
              </button> */}
            </div>
          </div>
          <div className="flex p-[10px] md:p-5 pt-0 md:pt-4">
            {isGridView ? (
              <>
                {tradeList && tradeList?.length ? (
                  <div className="w-full">
                    <div className="grid flex-1 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4">
                      {tradeList?.map((item, index) => {
                        return (
                          <DealGridView
                            {...item}
                            key={index}
                            isBuy={!item?.trade_type}
                            onButtonClick={() => {
                              setSelectedTrade(item);
                              if (!item?.trade_type) {
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
                      It seems There is no premarket deal found. Please Refresh
                      the page for update the page
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col flex-1 gap-y-4">
                <div className="grid items-center w-full px-5 text-sm font-medium grid-cols-13 text-gray500 dark:text-gray500Dark">
                  <p className="col-span-2">Offer</p>
                  <p className="col-span-2">For</p>
                  <p className="col-span-2">Settle Starts</p>
                  <p className="col-span-2">Settle Ends </p>
                  <p className="col-span-2">Views</p>
                  <p className="col-span-1">Progress</p>
                  <p className="col-span-2 justify-self-end">Action</p>
                </div>
                {tradeList && tradeList?.length ? (
                  <div className="w-full">
                    <div className="flex flex-col gap-y-3">
                      {tradeList?.map((item, index) => {
                        return (
                          <DealTableView
                            {...item}
                            key={index}
                            isBuy={!item?.trade_type}
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
                      It seems There is no premarket deal found. Please Refresh
                      the page for update the page
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {successModal ? (
        <SuccessModal
          {...successMessages}
          closeModal={() => {
            getTrades();
            setSuccessModal(false);
          }}
          handleViewOrder={() => {
            navigate(`/dashboard`);
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
          isPremarket={true}
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
          onConfirmClick={handleBuyConfirmation}
          isPremarket={true}
          loading={loading}
          {...selectedTrade}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Premarket;
