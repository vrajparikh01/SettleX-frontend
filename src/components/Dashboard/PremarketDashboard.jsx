import React, { useEffect, useState } from "react";
import NoTransaction from "../../assets/images/NoTransaction.svg";
import {
  deletePremarketDeal,
  getPremarketInvestment,
  getPremarketTrade,
  updatePremarketInvestment,
  updatePremarketTrade,
} from "../../services/premarket";
import PremarketCreatedTableView from "./PremarketCreatedTableView";
import Pagination from "../common/Pagination";
import PremarketInvestedTableView from "./PremarketInvestedTableView";
import { useAccount, useWriteContract } from "wagmi";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { config, premarket_contract } from "../../config/contract";
import PremarketABI from "../../contract/premarketAbi.json";
import SuccessModal from "../modal/SuccessModal";
import LoadingModal from "../modal/LoadingModal";
import { toast } from "react-toastify";

function PremarketDashboard({
  updatePremarketData = false,
  setUpdatePremarketData = () => {},
}) {
  const account = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [premarketTradeList, setPremarketTradeList] = useState([]);
  const [size, setSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [userPremarketInvestments, setUserPremarketInvestment] = useState([]);
  const [sizeInvestment, setSizeInvestment] = useState(0);
  const [totalPagesInvestment, setTotalPagesInvestment] = useState(0);
  const [pageInvestment, setPageInvestment] = useState(1);
  const [totalTokensInvestment, setTotalTokensInvestment] = useState(0);
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState();
  const [successModal, setSuccessModal] = useState(false);
  const [successMessages, setSuccessMessages] = useState({
    successText: "",
    descText: "",
  });

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
      console.log("Error:: OtcDetails : Checkbalance ", error);
    }
  }

  async function handleDistribute(offerId, selectedPremarketTrade) {
    setDistributionLoading(true);
    const isBalanceSufficient = await checkBalance(
      selectedPremarketTrade?.filled_token_amount, //Check filled amount/total amount
      selectedPremarketTrade?.offer_token?.number_of_decimals,
      selectedPremarketTrade?.offer_token?.token_address
    );
    if (!isBalanceSufficient) {
      console.log("Err");
      setDistributionLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed due to insufficient balance",
      });
      setSuccessModal(true);
      return;
    }

    const isApproved = await callApprove(
      selectedPremarketTrade?.filled_token_amount, //Check filled amount/total amount
      selectedPremarketTrade?.offer_token?.number_of_decimals,
      selectedPremarketTrade?.offer_token?.token_address
    );
    if (!isApproved) {
      console.log("Err2");
      setDistributionLoading(false);
      setSuccessModal(true);
      return;
    }

    try {
      const approveContractHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "distributeTokensSell",
        args: [offerId],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      console.log("Approce Contract", approveContractHash);
      const approveConfirmation = await waitForTransactionReceipt(config, {
        hash: approveContractHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      if (approveContractHash && approveConfirmation) {
        try {
          const trade = {
            chain_id: account?.chainId,
            wallet_address: account?.address,
            is_distributed: true,
            is_claimed: selectedPremarketTrade?.is_claimed,
          };
          console.log("Data", trade);
          const res = await updatePremarketTrade(
            trade,
            selectedPremarketTrade?._id
          );
          console.log("ress", res);
          if (res) {
            setDistributionLoading(false);
            setSuccessMessages({
              successText: "Success! Your Order has been updated!",
              descText: "Your order is updated on the Premarket.",
              transactionHash: approveContractHash,
            });
            setSuccessModal(true);
          }
        } catch (err) {
          console.log("Error", err);
          setDistributionLoading(false);
          setSuccessMessages({
            isSuccess: false,
            successText: "Failure!",
            descText: "Failed to update the order",
            errorMessage:
              err?.shortMessage?.split(":")[1] ||
              err?.shortMessage ||
              err?.message ||
              "",
          });
          setSuccessModal(true);
          return;
        }
      } else {
        console.log("Err2");
        setDistributionLoading(false);
        setSuccessMessages({
          isSuccess: false,
          successText: "Failure!",
          descText: "Your order is failed",
        });
        setSuccessModal(true);
        return;
      }
    } catch (err) {
      console.log("Err", err);
      setDistributionLoading(false);
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
      setSuccessModal(true);
    }
  }

  async function handleInvestmentDistribute(offerId, selectedPremarketTrade) {
    console.log("selected", selectedPremarketTrade, offerId);
    setDistributionLoading(true);
    const isBalanceSufficient = await checkBalance(
      selectedPremarketTrade?.invest_token_amount, //Check filled amount/total amount
      selectedPremarketTrade?.trade_info?.offer_token?.number_of_decimals,
      selectedPremarketTrade?.trade_info?.offer_token?.token_address
    );
    if (!isBalanceSufficient) {
      console.log("Err");
      setDistributionLoading(false);
      setSuccessMessages({
        isSuccess: false,
        successText: "Failure!",
        descText: "Your order is failed due to insufficient balance",
      });
      setSuccessModal(true);
      return;
    }

    const isApproved = await callApprove(
      selectedPremarketTrade?.invest_token_amount, //Check filled amount/total amount
      selectedPremarketTrade?.trade_info?.offer_token?.number_of_decimals,
      selectedPremarketTrade?.trade_info?.offer_token?.token_address
    );
    if (!isApproved) {
      console.log("Err2");
      setDistributionLoading(false);
      setSuccessModal(true);
      return;
    }

    try {
      const approveContractHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "distributeTokensBuy",
        args: [offerId, account?.address],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      console.log("Approce Contract", approveContractHash);
      const approveConfirmation = await waitForTransactionReceipt(config, {
        hash: approveContractHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      console.log("Heyy", approveConfirmation, approveContractHash);
      if (approveContractHash && approveConfirmation) {
        try {
          const trade = {
            chain_id: account?.chainId,
            wallet_address: account?.address,
            is_distributed: true,
            is_claimed: false,
          };
          console.log("Data", trade);
          const res = await updatePremarketInvestment(
            trade,
            selectedPremarketTrade?._id
          );
          console.log("ress", res);
          if (res) {
            setDistributionLoading(false);
            setSuccessMessages({
              successText: "Success! Your Order has been updated!",
              descText: "Your order is updated on the Premarket.",
              transactionHash: approveContractHash,
            });
            setSuccessModal(true);
          }
        } catch (err) {
          console.log("Error", err);
          setDistributionLoading(false);
          setSuccessMessages({
            isSuccess: false,
            successText: "Failure!",
            descText: "Failed to update the order",
            errorMessage:
              err?.shortMessage?.split(":")[1] ||
              err?.shortMessage ||
              err?.message ||
              "",
          });
          setSuccessModal(true);
          return;
        }
      } else {
        console.log("Err2");
        setDistributionLoading(false);
        setSuccessMessages({
          isSuccess: false,
          successText: "Failure!",
          descText: "Your order is failed",
        });
        setSuccessModal(true);
        return;
      }
    } catch (err) {
      console.log("Err", err);
      setDistributionLoading(false);
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
      setSuccessModal(true);
    }
  }

  async function handleCancelTrade(offerId, selectedPremarketTrade) {
    setDistributionLoading(true);
    try {
      const approveContractHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "distributeAfter24HoursBuy",
        args: [offerId],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      console.log("Approce Contract", approveContractHash);
      const approveConfirmation = await waitForTransactionReceipt(config, {
        hash: approveContractHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      if (approveContractHash && approveConfirmation) {
        try {
          const trade = {
            chain_id: account?.chainId,
            wallet_address: account?.address,
            is_distributed: selectedPremarketTrade?.is_distributed,
            is_claimed: true,
          };
          console.log("Data", trade);
          const res = await updatePremarketTrade(
            trade,
            selectedPremarketTrade?._id
          );
          console.log("ress", res);
          if (res) {
            setDistributionLoading(false);
            setSuccessMessages({
              successText: "Success! Your Order has been updated!",
              descText: "Your order is updated on the Premarket.",
              transactionHash: approveContractHash,
            });
            setSuccessModal(true);
          }
        } catch (err) {
          console.log("Error", err);
          setDistributionLoading(false);
          setSuccessMessages({
            isSuccess: false,
            successText: "Failure!",
            descText: "Failed to update the order",
            errorMessage:
              err?.shortMessage?.split(":")[1] ||
              err?.shortMessage ||
              err?.message ||
              "",
          });
          setSuccessModal(true);
          return;
        }
      } else {
        console.log("Err2");
        setDistributionLoading(false);
        setSuccessMessages({
          isSuccess: false,
          successText: "Failure!",
          descText: "Your order is failed",
        });
        setSuccessModal(true);
        return;
      }
    } catch (err) {
      console.log("Err", err);
      setDistributionLoading(false);
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
      setSuccessModal(true);
    }
  }

  async function handleDeleteTrade(offerId, selectedPremarketTrade) {
    setCancelLoading(true);
    try {
      const deleteOfferHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "cancelOffer",
        args: [offerId],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      console.log("Delete Contract", deleteOfferHash);
      const deleteConfirmation = await waitForTransactionReceipt(config, {
        hash: deleteOfferHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      if (deleteOfferHash && deleteConfirmation) {
        try {
          const trade = {
            chain_id: account?.chainId,
            wallet_address: account?.address,
          };
          console.log("Data", trade);
          const res = await deletePremarketDeal(
            trade,
            selectedPremarketTrade?._id
          );
          console.log("ress", res);
          if (res) {
            setCancelLoading(false);
            toast.success("Deal deleted successfully");
            getUserPremarketTrade();
          }
        } catch (err) {
          console.log("Error", err);
          setCancelLoading(false);
          toast.error("Deal deleted Failed");
          return;
        }
      } else {
        console.log("Err2");
        setCancelLoading(false);
        toast.error("Deal deleted Failed");
        return;
      }
    } catch (err) {
      console.log("Err", err);
      setCancelLoading(false);
      toast.error("Deal deleted Failed");
    }
  }

  async function handleClaimBackUntradedAmount(
    offerId,
    selectedPremarketTrade
  ) {
    setCancelLoading(true);
    try {
      const reclaimHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "distributeBuyPartialCreator",
        args: [offerId],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      console.log("Delete Contract", reclaimHash);
      const reclaimConfirmation = await waitForTransactionReceipt(config, {
        hash: reclaimHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      if (reclaimHash && reclaimConfirmation) {
        try {
          const trade = {
            chain_id: account?.chainId,
            wallet_address: account?.address,
            is_distributed: selectedPremarketTrade?.is_distributed,
            is_claimed: selectedPremarketTrade?.is_claimed,
            is_untraded_claimed: true,
          };
          console.log("Data", trade);
          const res = await updatePremarketTrade(
            trade,
            selectedPremarketTrade?._id
          );
          console.log("ress", res);
          if (res) {
            setCancelLoading(false);
            toast.success("Claimed successfully");
          }
        } catch (err) {
          console.log("Error", err);
          setCancelLoading(false);
          toast.error("Claiming Failed");
          getUserPremarketTrade();
          return;
        }
      } else {
        console.log("Err2");
        setCancelLoading(false);
        toast.error("Claiming Failed");
        return;
      }
    } catch (err) {
      console.log("Err", err);
      setCancelLoading(false);
      toast.error("Claiming Failed");
    }
  }

  async function handleCancelInvestedTrade(offerId, selectedPremarketTrade) {
    console.log("selected", selectedPremarketTrade, offerId);
    setDistributionLoading(true);

    try {
      const approveContractHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: "distributeAfter24HoursSell",
        args: [offerId, account?.address],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      console.log("Approce Contract", approveContractHash);
      const approveConfirmation = await waitForTransactionReceipt(config, {
        hash: approveContractHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      console.log("Heyy", approveConfirmation, approveContractHash);
      if (approveContractHash && approveConfirmation) {
        try {
          const trade = {
            chain_id: account?.chainId,
            wallet_address: account?.address,
            is_distributed: selectedPremarketTrade?.is_distributed,
            is_claimed: true,
          };
          console.log("Data", trade);
          const res = await updatePremarketInvestment(
            trade,
            selectedPremarketTrade?._id
          );
          console.log("ress", res);
          if (res) {
            setDistributionLoading(false);
            setSuccessMessages({
              successText: "Success! Your Order has been updated!",
              descText: "Your order is updated on the Premarket.",
              transactionHash: approveContractHash,
            });
            setSuccessModal(true);
          }
        } catch (err) {
          console.log("Error", err);
          setDistributionLoading(false);
          setSuccessMessages({
            isSuccess: false,
            successText: "Failure!",
            descText: "Failed to update the order",
            errorMessage:
              err?.shortMessage?.split(":")[1] ||
              err?.shortMessage ||
              err?.message ||
              "",
          });
          setSuccessModal(true);
          return;
        }
      } else {
        console.log("Err2");
        setDistributionLoading(false);
        setSuccessMessages({
          isSuccess: false,
          successText: "Failure!",
          descText: "Your order is failed",
        });
        setSuccessModal(true);
        return;
      }
    } catch (err) {
      console.log("Err", err);
      setDistributionLoading(false);
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
      setSuccessModal(true);
    }
  }

  async function getUserPremarketTrade(page = 1, searchText = "") {
    try {
      const val = await getPremarketTrade(
        account?.address,
        account?.chainId,
        page,
        searchText
      );
      console.log("Vallllllllll", val);
      setPremarketTradeList(val?.data?.data?.trades);
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

  async function getUserSpecificInvestment(page = 1) {
    try {
      const val = await getPremarketInvestment(
        account?.address,
        page,
        account?.chainId
      ); //Need to change
      console.log("Vall", val);
      setUserPremarketInvestment(val?.data?.data?.trades);
      setSizeInvestment(val?.data?.data?.trades?.length);
      setTotalPagesInvestment(
        Math.floor(val?.data?.data?.totalTrades / 10) +
          (val?.data?.data?.totalTrades % 10 !== 0)
      );
      setTotalTokensInvestment(val?.data?.data?.totalTrades);
    } catch (err) {
      console.log("Err", err);
    }
  }

  const goToPage = async (page, created = true) => {
    if (created) {
      setPage(page);
      await getUserPremarketTrade(page);
    } else {
      setPageInvestment(page);
      await getUserSpecificInvestment(page);
    }
  };

  const handleNextPage = async (created = true) => {
    if (created) {
      setPage((prev) => prev + 1);
      await getUserPremarketTrade(page + 1);
    } else {
      setPageInvestment((prev) => prev + 1);
      await getUserSpecificInvestment(page + 1);
    }
  };

  const handlePrevPage = async (created = true) => {
    if (created) {
      setPage((prev) => prev - 1);
      await getUserPremarketTrade(page - 1);
    } else {
      setPageInvestment((prev) => prev - 1);
      await getUserSpecificInvestment(page - 1);
    }
  };

  useEffect(() => {
    if (account?.address) {
      getUserPremarketTrade();
      getUserSpecificInvestment();
    } else {
      setPremarketTradeList([]);
      setSize(0);
      setTotalPages(0);
      setTotalTokens(0);
      setUserPremarketInvestment([]);
      setSizeInvestment(0);
      setTotalPagesInvestment(0);
      setTotalTokensInvestment(0);
    }
  }, [account?.address]);

  useEffect(() => {
    if (updatePremarketData) {
      getUserPremarketTrade();
      setUpdatePremarketData(false);
    } else {
      setPremarketTradeList([]);
      setSize(0);
      setTotalPages(0);
      setTotalTokens(0);
    }
  }, [updatePremarketData]);

  return (
    <div>
      <div className="flex flex-col mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">My Created Deals</p>
        </div>
        <div className="flex py-[10px] md:py-5 pt-0 md:pt-4">
          <div className="flex flex-col flex-1 gap-y-4">
            <div className="grid items-center w-full grid-cols-10 px-2 text-sm font-medium text-gray500 dark:text-gray500Dark">
              <p className="col-span-2">Offer</p>
              <p className="col-span-1">For</p>
              <p className="col-span-2">Settle Starts</p>
              <p className="col-span-2">Settle Ends </p>
              <p className="col-span-1">Progress</p>
              <p className="col-span-2 justify-self-center">Actions</p>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-y-3">
                {premarketTradeList && premarketTradeList?.length ? (
                  premarketTradeList?.map((item, index) => {
                    return (
                      <PremarketCreatedTableView
                        {...item}
                        key={index}
                        loading={
                          selectedOfferId ==
                            item?.trade_index_from_blockchain &&
                          distributionLoading
                        }
                        handleDistribute={(offerId) => {
                          console.log("hereee", item);
                          setSelectedOfferId(offerId);
                          handleDistribute(offerId, item);
                        }}
                        handleCancel={(offerId) => {
                          console.log("hereeeeeeeeeeeee", item);
                          setSelectedOfferId(offerId);
                          handleCancelTrade(offerId, item);
                        }}
                        handleDelete={(offerId) => {
                          console.log("hereeeeeeeeeeeee", item);
                          setSelectedOfferId(offerId);
                          handleDeleteTrade(offerId, item);
                        }}
                        handleClaimBackUntradedAmount={(offerId) => {
                          console.log("hereeeeeeeeeeeee", item);
                          setSelectedOfferId(offerId);
                          handleClaimBackUntradedAmount(offerId, item);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center w-full text-base font-medium text-gray500 dark:text-gray500Dark gap-y-4 py-7">
                    <img src={NoTransaction} alt="no transactions" />
                    <p className="w-full px-10 text-center md:w-1/2">
                      It seems you have not created any PREMARKET deals. Please
                      Refresh the page for update the page
                    </p>
                  </div>
                )}
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
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">My Contributed Deals</p>
        </div>
        <div className="flex py-[10px] md:py-5 pt-0 md:pt-4">
          <div className="flex flex-col flex-1 gap-y-4">
            <div className="grid items-center w-full grid-cols-10 px-2 text-sm font-medium text-gray500 dark:text-gray500Dark">
              <p className="col-span-2">Offer</p>
              <p className="col-span-1">For</p>
              <p className="col-span-2">Settle Starts</p>
              <p className="col-span-2">Settle Ends </p>
              <p className="col-span-1">Progress</p>
              <p className="col-span-2 justify-self-center">Actions</p>
            </div>
            <div className="w-full">
              <div className="flex flex-col gap-y-3">
                {userPremarketInvestments &&
                userPremarketInvestments?.length ? (
                  userPremarketInvestments?.map((item, index) => {
                    return (
                      <PremarketInvestedTableView
                        {...item}
                        key={index}
                        loading={
                          selectedOfferId ==
                            item?.trade_index_from_blockchain &&
                          distributionLoading
                        }
                        handleDistribute={(offerId) => {
                          console.log("hereee", item);
                          setSelectedOfferId(offerId);
                          handleInvestmentDistribute(offerId, item);
                        }}
                        handleCancel={(offerId) => {
                          console.log("hereeeeeeeeeeeee", item);
                          setSelectedOfferId(offerId);
                          handleCancelInvestedTrade(offerId, item);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center w-full text-base font-medium text-gray500 dark:text-gray500Dark gap-y-4 py-7">
                    <img src={NoTransaction} alt="no transactions" />
                    <p className="w-full px-10 text-center md:w-1/2">
                      It seems you have not invested in any PREMARKET deals.
                      Please Refresh the page for update the page
                    </p>
                  </div>
                )}
              </div>
              {totalPagesInvestment > 1 && (
                <Pagination
                  currentPage={pageInvestment}
                  size={sizeInvestment}
                  totalResults={totalTokensInvestment}
                  totalPages={totalPagesInvestment}
                  goToPage={(page) => {
                    goToPage(page, false);
                  }}
                  handleNextPage={() => {
                    handleNextPage(false);
                  }}
                  handlePrevPage={() => {
                    handlePrevPage(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
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
      {distributionLoading ? <LoadingModal /> : <></>}
      {cancelLoading ? <LoadingModal /> : <></>}
    </div>
  );
}

export default PremarketDashboard;
