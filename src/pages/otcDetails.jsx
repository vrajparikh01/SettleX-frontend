import React, { useEffect, useState } from "react";
import Toggle from "../components/common/ToggleTabs";
import BgCard from "../components/BgCard";
import {
  BackArrow,
  Discord,
  DownloadIcon,
  GridIcon,
  ListIcon,
  Telegram,
  Twitter,
  Web,
} from "../assets/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import BuySummary from "../components/modal/BuySummary";
import SuccessModal from "../components/modal/SuccessModal";
import SellSummary from "../components/modal/SellSummary";
import LavaLogo from "../assets/images/LavaLogo.png";
import OtcGrid from "../components/OtcGrid";
import OtcList from "../components/OtcList";
import NoTransaction from "../assets/images/NoTransaction.svg";
import { getTokenTrade, postActivity, updateView } from "../services/otc";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import { waitForTransactionReceipt, readContract } from "wagmi/actions";
import { config, otc_contract } from "../config/contract";
import OtcAbi from "../contract/otcAbi.json";
import { useAccount, useWriteContract } from "wagmi";

function OtcDetails() {
  const { writeContractAsync } = useWriteContract();
  const account = useAccount();
  let [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const viewId = searchParams.get("viewId");
  const navigate = useNavigate();
  const tabs = [
    { label: "Trades", value: "trades" },
    { label: "Transactions", value: "transactions" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessages, setSuccessMessages] = useState({
    successText: "",
    descText: "",
  });
  const [buySummary, setBuySummary] = useState(false);
  const [sellSummary, setSellSummary] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [tradeList, setTradeList] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState({});
  const [loading, setLoading] = useState(false);

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
    getTokenTrades();
    setSuccessModal(false);
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
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: selectedTrade?.trade_type
          ? "Your buy order is failed"
          : "Your sell order is failed",
      });
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const val = {
      trade_id: selectedTrade?._id,
      number_of_token: numberOfTokenByUser,
      price_per_token: selectedTrade?.price_per_token,
      activity_type: 1,
      transaction_hash: addedActivityHash,
      from_address: selectedTrade?.receiver_wallet_address,
      to_address: account?.address,
      current_wallet_address: account?.address,
    };
    try {
      const res = await postActivity(val);
      if (res) {
        setSuccessMessages({
          successText: "Success!",
          descText: "Your buy order in successfully executed.",
          transactionHash: addedActivityHash,
        });
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
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: selectedTrade?.trade_type
          ? "Your buy order is failed"
          : "Your sell order is failed",
      });
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
      return;
    }

    const val = {
      trade_id: selectedTrade?._id,
      number_of_token: numberOfTokenByUser,
      price_per_token: selectedTrade?.price_per_token,
      activity_type: 0,
      transaction_hash: addedActivityHash,
      from_address: selectedTrade?.receiver_wallet_address,
      to_address: account?.address,
      current_wallet_address: account?.address,
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
      });
      setBuySummary(false);
      setSellSummary(false);
      setSuccessModal(true);
    }
  }

  async function getTokenTrades() {
    try {
      const val = await getTokenTrade(id);
      console.log("Vall", val);
      setTradeList(val?.data?.data?.trades);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function increaseViewCount() {
    await updateView(viewId);
  }

  useEffect(() => {
    getTokenTrades();
    increaseViewCount();
  }, []);
  return (
    <div className="px-5 py-4 md:px-8">
      <div className="flex items-center justify-between">
        <a
          className="flex items-center px-[14px] py-[10px] font-medium cursor-pointer gap-x-[10px] text-gray500 dark:text-gray500Dark border border-gray300 dark:border-gray300Dark w-fit rounded-full mb-5 bg-baseWhite dark:bg-black"
          onClick={() => {
            navigate(-1);
          }}
        >
          <BackArrow />
          <span className="hidden md:block">Back</span>
        </a>
        <div className="flex gap-x-[10px]">
          <a className="bg-baseWhite dark:bg-black flex items-center px-[14px] py-[10px] font-semibold cursor-pointer gap-x-[10px] text-theme-green border border-theme-green text-sm w-fit rounded-full mb-5">
            <DownloadIcon />
            Pitch Deck
          </a>
          <a className="bg-baseWhite dark:bg-black flex items-center px-[14px] py-[10px] font-semibold cursor-pointer gap-x-[10px] text-theme-green border border-theme-green text-sm w-fit rounded-full mb-5">
            <DownloadIcon />
            White paper
          </a>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between w-full bg-gray100 dark:bg-gray100Dark py-3 px-5 rounded-[14px] border border-gray200 dark:border-gray200Dark">
        <div className="flex items-center gap-x-4 md:gap-x-3">
          <img
            src={LavaLogo}
            alt="logo"
            className="w-[50px] h-[50px] md:w-20 md:h-20 rounded-full"
          />
          <div className="flex flex-col">
            <p className="flex items-center text-xl font-semibold md:text-2xl text-baseWhiteDark dark:text-baseWhite whitespace-nowrap">
              B2 Squared
              <span className="py-1 pl-3 pr-3 ml-1 text-xs font-medium rounded-full md:ml-3 md:text-sm bg-gray500/10 dark:bg-gray500Dark/10 text-gray500 dark:text-gray500Dark">
                Awaiting TGE
              </span>
            </p>
            <div className="flex items-center gap-x-2 md:mt-[14px]">
              <img
                src={LavaLogo}
                className="w-4 h-4 md:w-[22px] md:h-[22px] rounded-full"
              />
              <p className="text-xs font-medium md:text-base text-baseWhiteDark dark:text-baseWhite">
                The Presale Club
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between mt-4 md:flex-col md:mt-0">
          <p className="font-semibold text-xl md:text-[32px] md:leading-[44px] text-baseWhiteDark dark:text-baseWhite">
            $0.0286
          </p>
          <div className="flex items-center gap-x-[10px] w-fit md:mt-3">
            {true ? <Web /> : <></>}
            {true ? <Twitter /> : <></>}
            {true ? <Telegram /> : <></>}
            {true ? <Discord /> : <></>}
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-6 md:flex-row gap-x-5">
        <div className="w-full md:w-[25%] bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark p-4 rounded-[14px]">
          <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite pb-[10px] border-b border-gray300 dark:border-gray300Dark ">
            Token Details
          </p>
          <div className="flex py-[10px] border-b border-gray300 dark:border-gray300Dark">
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                Last Traded Price
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                0.742 USDT
              </p>
            </div>
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                Floor Price
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                0.739 USDT
              </p>
            </div>
          </div>
          <div className="flex py-[10px] border-b border-gray300 dark:border-gray300Dark ">
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                Highest Bid
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                0.4 USDT
              </p>
            </div>
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                Average Price
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                0.0481 USDT
              </p>
            </div>
          </div>
          <div className="flex py-[10px] border-b border-gray300 dark:border-gray300Dark ">
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                Round
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                0
              </p>
            </div>
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                Fully diluted valuation
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                1.2 Billion
              </p>
            </div>
          </div>
          <div className="flex py-[10px] border-b border-gray300 dark:border-gray300Dark ">
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                Allocation
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                $0.00
              </p>
            </div>
            <div className="flex flex-col flex-1 gap-y-1">
              <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                TGE
              </p>
              <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                Not set
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-1 py-[10px] border-b border-gray300 dark:border-gray300Dark ">
            <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
              Vesting summary
            </p>
            <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
              1-Year cliff and 24 months of vesting
            </p>
          </div>
          <div className="flex flex-col gap-y-1 pt-[10px]">
            <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
              Description
            </p>
            <p className="text-base font-medium text-baseWhiteDark dark:text-baseWhite">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Scelerisque in dictum non consectetur a erat nam. Scelerisque
              fermentum dui faucibus in ornare quam. Non blandit massa enim nec
              dui nunc mattis. Rhoncus aenean vel elit scelerisque mauris. Elit
              duis tristique sollicitudin nibh sit amet. Ipsum dolor sit amet
              consectetur adipiscing elit duis.{" "}
            </p>
          </div>
        </div>
        <div className="w-full md:w-[75%] mt-4 md:mt-0">
          <div className="flex items-center justify-between pb-3 md:pb-[10px] border-b border-gray400 dark:border-gray400Dark">
            <Toggle
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              className="!w-fit flex-none"
            />
            <div className="hidden md:flex items-center bg-baseWhite dark:bg-black px-5 py-[10px] gap-x-5 rounded-full">
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
          </div>
          <div className="flex">
            {activeTab?.value == "trades" ? (
              <div className="flex-1">
                {isGridView ? (
                  <div className="w-full mt-4 md:mt-6">
                    {tradeList && tradeList.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4">
                        {tradeList.map((item, index) => {
                          return (
                            <OtcGrid
                              {...item}
                              key={index}
                              isBuy={item?.trade_type}
                              redirect={false}
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
                ) : (
                  <div className="flex flex-col gap-y-[10px]">
                    <div className="grid items-center w-full grid-cols-6 px-5 py-5 text-sm font-medium text-gray500 dark:text-gray500Dark">
                      <p className="col-span-2">Offer</p>
                      <p className="">For</p>
                      <p className="">Views</p>
                      <p className="">Progress</p>
                      <p className="justify-self-end">Action</p>
                    </div>
                    {tradeList && tradeList.length ? (
                      tradeList.map((item, index) => {
                        return (
                          <OtcList
                            logo={LavaLogo}
                            {...item}
                            redirect={false}
                            key={index}
                            isBuy={item?.trade_type}
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
                      })
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
                )}
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <div className="grid grid-cols-2 gap-y-4 md:flex items-center gap-x-4 w-full py-[10px] md:border-0 md:border-b border-gray400 dark:border-gray400Dark bg-baseWhite dark:bg-black my-[10px] md:my-0 border rounded-2xl md:rounded-none px-[10px] md:px-0">
                  <BgCard title="$0.00" desc="Contributed" className="flex-1" />
                  <BgCard
                    title="0"
                    desc="Spent on trading"
                    className="flex-1"
                  />
                  <BgCard
                    title="$0.00"
                    desc="Earned in trading"
                    className="flex-1"
                  />
                  <BgCard
                    title="0 tokens"
                    desc="Tokens received"
                    className="flex-1"
                  />
                  <BgCard title="$0.00" desc="Refunds" className="flex-1" />
                </div>
                <div>
                  <div className="items-center hidden w-full grid-cols-8 p-3 pt-6 md:grid">
                    <p className="col-span-2 text-sm font-medium text-gray500 dark:text-gray500Dark">
                      Event
                    </p>
                    <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                      Pool,fee
                    </p>
                    <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                      Amount
                    </p>
                    <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                      Tokens
                    </p>
                    <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                      Network
                    </p>
                    <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                      Transaction
                    </p>
                    <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                      Date
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full text-base font-medium bg-gray100 dark:bg-gray100Dark py-7 rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
                    <img src={NoTransaction} alt="no transactions" />
                    <p className="w-full px-10 text-center md:w-1/2">
                      It seems There is no transaction were found. Please
                      Refresh the page for update the page
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
      {successModal ? (
        <SuccessModal {...successMessages} closeModal={closeSuccessModal} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default OtcDetails;
