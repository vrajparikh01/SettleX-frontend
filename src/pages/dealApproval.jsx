import React, { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import Dropdown from "../components/common/Dropdown";
import Loading from "../assets/icons/loading";
import Button from "../components/common/Button";
import { lotSize } from "../constants/common";
import { useSearchParams } from "react-router-dom";
import { getBrokerLinkData } from "../services/broker";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { config, otc_contract } from "../config/contract";
import OtcAbi from "../contract/otcAbi.json";
import { postTrade } from "../services/otc";
import SuccessModal from "../components/modal/SuccessModal";
import { FailIcon, TickIcon } from "../assets/icons";
import LoadingModal from "../components/modal/LoadingModal";
import { formatNumber } from "../utils";
import { toast } from "react-toastify";

function DealApproval() {
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedLotSize, setSelectedLotSize] = useState();

  const [selectedToken, setSelectedToken] = useState({});
  const [selectedColateralToken, setSelectedColateralToken] = useState({});

  const [totalToken, setTotalToken] = useState();
  const [pricePerToken, setPricePerToken] = useState();
  const [receivingWallet, setReceivingWallet] = useState("");
  const [brokerage, setBrokerage] = useState();
  const [dealData, setDealData] = useState({});

  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [successMessages, setSuccessMessages] = useState({
    successText: "",
    descText: "",
  });

  async function getDealData() {
    try {
      setDataLoading(true);
      const res = await getBrokerLinkData(searchParams.get("id"));
      const val = res?.data?.data;
      console.log("val", val);
      const isExpired = checkExpiry(val?.expire_time);
      if (isExpired) {
        setIsLinkExpired(true);
      }
      setDealData(res?.data?.data);
      setTotalToken(val?.total_token);
      setPricePerToken(val?.price_per_token);
      setReceivingWallet(val?.client_address);
      setBrokerage(val?.broker_fee);
      const newLotSize = lotSize?.find((item) => item?.value == val?.lot_size);
      setSelectedLotSize(newLotSize);
      setSelectedToken({
        label: val?.offer_token?.symbol,
        logo: <img src={val?.offer_token?.token_image} alt="token_image" />,
      });
      setSelectedColateralToken({
        label: val?.receive_token?.symbol,
        logo: <img src={val?.receive_token?.token_image} alt="token_image" />,
      });
      setDataLoading(false);
    } catch (err) {
      console.log("Err", err);
      setDataLoading(false);
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
      console.log("Error:: callApproval ", error);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed",
        errorMessage:
          error?.shortMessage || "User did not approved the transaction",
      });
    }
  }

  async function addTrade(trade) {
    try {
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
            trade?.offerTokenAddress, // Offer Token Address
            trade?.receiveTokenAddress, // Receive Token Address
            account?.address, // User Address
            dealData?.lot_size, // Lot Tupe
            0, // Amount Sold
            0, // Status (0=Open,2=Closed)
            true, // isBroker
            dealData?.broker_fee, // BrokerFree
            dealData?.broker_address, // Recipent Address
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
      console.log("Error:: OtcDetails : callAddTrade ", error);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Order creation failed",
        errorMessage:
          error?.shortMessage.split(":")[1] ||
          error?.shortMessage ||
          "Error while executing the deal",
      });
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
      return Number(index);
    } catch (error) {
      console.log("Error:: OtcDetails : Checkbalance ", error);
    }
  }

  async function handleConfirmClick() {
    const isExpired = checkExpiry(dealData?.expire_time);
    if (isExpired) {
      setIsLinkExpired(true);
      toast.error("Link Expired");
      return;
    }
    let offerTokenObj = {},
      receiveTokenObj = {};
    let offerToken,
      reciveToken,
      reciveTokenDecimals,
      offerTokenDecimals,
      offerTokenAddress,
      receiveTokenAddress;
    if (!dealData?.trade_type) {
      reciveToken =
        (totalToken * pricePerToken) / dealData?.receive_token?.price;
      offerToken = totalToken;
      reciveTokenDecimals = dealData?.receive_token?.number_of_decimals;
      offerTokenDecimals = dealData?.offer_token?.number_of_decimals; // usdt,eth ...
      offerTokenAddress = dealData?.offer_token?.token_address;
      receiveTokenAddress = dealData?.receive_token?.token_address;
      offerTokenObj = {
        offer_token: dealData?.offer_token?.token_address,
        offer_token_symbol: dealData?.offer_token?.symbol,
        offer_token_name: dealData?.offer_token?.name,
        offer_token_decimals: dealData?.offer_token?.number_of_decimals,
        offer_token_image: dealData?.offer_token?.token_image,
      };
      receiveTokenObj = {
        receive_token: dealData?.receive_token?.token_address,
        receive_token_symbol: dealData?.receive_token?.symbol,
        receive_token_name: dealData?.receive_token?.name,
        receive_token_decimals: dealData?.receive_token?.number_of_decimals,
        receive_token_image: dealData?.receive_token?.token_image,
      };
    } else {
      reciveToken = totalToken;
      offerToken =
        (totalToken * pricePerToken) / dealData?.receive_token?.price;
      reciveTokenDecimals = dealData?.offer_token?.number_of_decimals;
      offerTokenDecimals = dealData?.receive_token?.number_of_decimals; // usdt,eth ...
      offerTokenAddress = dealData?.receive_token?.token_address;
      receiveTokenAddress = dealData?.offer_token?.token_address;
      offerTokenObj = {
        offer_token: dealData?.receive_token?.token_address,
        offer_token_symbol: dealData?.receive_token?.symbol,
        offer_token_name: dealData?.receive_token?.name,
        offer_token_decimals: dealData?.receive_token?.number_of_decimals,
        offer_token_image: dealData?.receive_token?.token_image,
      };
      receiveTokenObj = {
        receive_token: dealData?.offer_token?.token_address,
        receive_token_symbol: dealData?.offer_token?.symbol,
        receive_token_name: dealData?.offer_token?.name,
        receive_token_decimals: dealData?.offer_token?.number_of_decimals,
        receive_token_image: dealData?.offer_token?.token_image,
      };
    }
    setLoading(true);
    const isBalanceSufficient = await checkBalance(
      offerToken,
      offerTokenDecimals,
      offerTokenAddress
    );
    if (!isBalanceSufficient) {
      console.log("Err");
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Order creation failed due to insufficient balance",
      });
      setSuccessModal(true);
      return;
    }

    const isApproved = await callApprove(
      offerToken,
      offerTokenDecimals,
      offerTokenAddress
    );
    if (!isApproved) {
      console.log("Err2");
      setLoading(false);
      setSuccessModal(true);
      return;
    }
    const tradeToContract = {
      offerToken,
      reciveToken,
      offerTokenDecimals,
      reciveTokenDecimals,
      offerTokenAddress,
      receiveTokenAddress,
    };

    const addedTradeHash = await addTrade(tradeToContract);

    if (!addedTradeHash) {
      console.log("Err3");
      setLoading(false);
      setSuccessModal(true);
      return;
    }

    const lastIndex = await callGetLastAddedTradeIndex(addedTradeHash);

    const trade = {
      ...receiveTokenObj,
      ...offerTokenObj,
      total_token: Number(dealData?.total_token),
      price_per_token: Number(dealData?.price_per_token),
      chain_id: dealData?.chain_id,
      trade_type: dealData?.trade_type,
      lot_size: dealData?.lot_size,
      receiver_wallet_address: dealData?.client_address,
      trader_wallet_address: dealData?.client_address,
      is_broker: true,
      broker_fee: dealData?.broker_fee,
      trade_index_from_blockchain: lastIndex,
      trade_hash_from_blockchain: addedTradeHash,
      broker_link_id: searchParams.get("id"),
      total_receive_token: reciveToken,
    };
    try {
      const res = await postTrade(trade);
      console.log("ress", res);
      if (res) {
        setLoading(false);
        setSuccessMessages({
          successText: "Success! Your Order is now Live!",
          descText: dealData?.trade_type
            ? "Your buy order in now live on the OTC broker market."
            : "Your sell order in now live on the OTC broker market.",
          transactionHash: addedTradeHash,
        });
        setSuccessModal(true);
        getDealData();
      }
    } catch (err) {
      console.log("Error", err);
      setLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Order creation failed",
        errorMessage:
          err?.shortMessage?.split(":")[1] ||
          err?.shortMessage ||
          err?.message ||
          "",
      });
      setSuccessModal(true);
      return;
    }
  }

  function checkExpiry(expiryTime) {
    return new Date().getTime() / 1000 > expiryTime;
  }

  useEffect(() => {
    if (searchParams.get("id") && account?.address) {
      getDealData();
    }
  }, [searchParams.get("id"), account?.address]);

  return (
    <div className="px-5 py-4 md:px-8">
      {dataLoading ? (
        <div className="flex items-center justify-center">
          <Loading bg={"#29BD35"} width={60} height={60} />
        </div>
      ) : dealData?.is_deal_created ? (
        <div className="flex items-center justify-center text-xl font-semibold">
          The deal is already created and live on the brokers market.
        </div>
      ) : isLinkExpired ? (
        <div className="flex items-center justify-center text-xl font-semibold">
          The link has expired, kindly connect to your broker!
        </div>
      ) : (
        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-baseWhiteDark dark:text-baseWhite">
            {!dealData?.trade_type
              ? "Create Sell Request"
              : "Create Buy Request"}
          </p>
          <div className="mt-4">
            <div className="flex flex-col">
              <div className="bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px]">
                <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                  Project
                </p>
                <Dropdown
                  items={[]}
                  selectedItem={selectedToken}
                  setSelectedItem={(selectedItem) => {
                    setSelectedToken(selectedItem);
                  }}
                  className={"!w-full self-end"}
                  loading={loading}
                  disabled={true}
                />
              </div>
            </div>
            <p className="mt-[10px] md:mt-4 text-base md:text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
              Investment Info
            </p>
            <div className="bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] mt-[10px] flex flex-col gap-y-4">
              <div className="flex gap-x-[10px]">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Token Amount
                  </p>
                  <input
                    type="text"
                    className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                    placeholder="Enter number of tokens"
                    onChange={(e) => {
                      setTotalToken(e.target.value);
                    }}
                    value={formatNumber(String(totalToken))}
                    onWheel={(e) => {
                      e.target.blur();
                    }}
                    disabled={true}
                    title={loading ? "Loading..." : ""}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Fill Type
                  </p>
                  <Dropdown
                    items={[]}
                    selectedItem={selectedLotSize}
                    setSelectedItem={(selectedItem) => {
                      setSelectedLotSize(selectedItem);
                    }}
                    className={"!w-full self-end"}
                    loading={loading}
                    disabled={true}
                  />
                </div>
              </div>
              <div className="flex gap-x-[10px]">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Price Per Token
                  </p>
                  <input
                    type="text"
                    className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-black border-gray300 dark:border-gray300Dark"
                    placeholder="Enter Amount ($)"
                    onChange={(e) => {
                      setPricePerToken(e.target.value);
                    }}
                    onWheel={(e) => e.target.blur()}
                    value={formatNumber(String(pricePerToken))}
                    disabled={true}
                    title={loading ? "Loading..." : ""}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Token Request
                  </p>
                  <Dropdown
                    items={[]}
                    selectedItem={selectedColateralToken}
                    setSelectedItem={(selectedItem) => {
                      setSelectedColateralToken(selectedItem);
                    }}
                    className={"!w-full self-end"}
                    loading={loading}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-gray100 dark:bg-gray100Dark border-gray200 dark:border-gray200Dark mt-[10px] rounded-[14px] p-[10px] flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Client Wallet
              </p>
              <div className="relative w-full h-full">
                <input
                  type="text"
                  className="w-full font-semibold text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[13px] px-5 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                  placeholder="Please enter the wallet address"
                  onChange={(e) => {
                    setReceivingWallet(e.target.value);
                  }}
                  value={receivingWallet}
                  disabled={true}
                />
                <div
                  className="absolute right-0 mr-3 -translate-y-1/2 top-1/2"
                  title={
                    receivingWallet == account?.address
                      ? "Wallet Verified!"
                      : "Wallet Not Verified!"
                  }
                >
                  {receivingWallet == account?.address ? (
                    <TickIcon />
                  ) : (
                    <FailIcon />
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Brokerage Percentage
              </p>
              <input
                type="text"
                className="w-full font-semibold text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[13px] px-5 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                placeholder="Please enter brokerage percentage"
                onChange={(e) => {
                  setBrokerage(e.target.value);
                }}
                value={formatNumber(String(brokerage) || "")} // Use formatted value
                disabled={true}
              />
            </div>
          </div>
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-[14px] flex-1 justify-center w-full mt-4"
            onClick={handleConfirmClick}
            disabled={loading || !(receivingWallet == account?.address)}
          >
            {loading ? <Loading /> : "Confirm"}
          </Button>
          {successModal ? (
            <SuccessModal
              {...successMessages}
              closeModal={() => {
                setSuccessModal(false);
              }}
            />
          ) : (
            <></>
          )}
          {loading ? <LoadingModal /> : <></>}
        </div>
      )}
    </div>
  );
}

export default DealApproval;
