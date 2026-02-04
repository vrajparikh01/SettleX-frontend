import React, { useEffect, useState } from "react";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import "react-datepicker/dist/react-datepicker.css";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { otc_contract, premarket_contract } from "../config/contract";
import OfferSection from "../components/Admin/OfferSection";
import Button from "../components/common/Button";
import {
  addPremarketTokens,
  editPremarketTokens,
  getPremarketCollateralTokens,
  getPremarketTokens,
} from "../services/premarket";
import AdminTableView from "../components/Admin/AdminTableView";
import CollateralTokenTable from "../components/Admin/CollateralTokenTable";
import AddTokenModal from "../components/Admin/AddTokenModal";
import AddEquityDealModal from "../components/Admin/AddEquityDealModal";
import AddOtcTokenModal from "../components/Admin/AddOtcTokenModal";
import PremarketABI from "../contract/premarketAbi.json";
import OTCAbi from "../contract/otcAbi.json";
import Loading from "../assets/icons/loading";
import { toast } from "react-toastify";
import {
  addEquityDeal,
  addOtcToken,
  getEquityTokens,
  getOtcTokens,
} from "../services/admin";
import EquityDealTableView from "../components/Admin/EquityDealTableView";

function Admin() {
  const { writeContractAsync } = useWriteContract();

  const account = useAccount();
  const config = useConfig();
  const [premarketTokens, setPremarketTokens] = useState([]);
  const [collateralTokenList, setCollateralTokenList] = useState([]);
  const [otcTokenList, setOtcTokenList] = useState([]);
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [isAddEquityDealModalOpen, setIsAddEquityDealModalOpen] =
    useState(false);
  const [isAddOtcTokenModalOpen, setIsAddOtcTokenModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [isAdminValid, setIsAdminValid] = useState(false);
  const [isCollateral, setIsCollateral] = useState(false);
  const [equityDeals, setEquityDeals] = useState([]);

  async function getEquityDeals() {
    try {
      const val = await getEquityTokens(account?.chainId, 1, account?.address);
      console.log("val", val, val?.data?.data?.equities);
      setEquityDeals(val?.data?.data?.equities);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function getOwnerWalletAddress() {
    setDataLoading(true);
    try {
      const owner = await readContract(config, {
        address: otc_contract(account?.chainId),
        abi: OTCAbi,
        functionName: "owner",
        args: [],
      });
      console.log("owner", owner);
      if (owner && owner == account?.address) {
        setDataLoading(false);
        setIsAdminValid(true);
      } else {
        setDataLoading(false);
        setIsAdminValid(false);
      }
    } catch (error) {
      console.log("Owner ", error);
      setIsAdminValid(false);
      setDataLoading(false);
      return false;
    }
  }

  async function getPremarketTokenList() {
    try {
      const val = await getPremarketTokens(account?.chainId);
      console.log("val", val, val?.data?.data?.tokens);
      setPremarketTokens(val?.data?.data?.tokens);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function getCollateralTokenList() {
    try {
      const res = await getPremarketCollateralTokens(account?.chainId);
      console.log("Ress", res);
      setCollateralTokenList(res?.data?.data?.tokens);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function getOtcTokenList() {
    console.log("OTCCC");
    try {
      const res = await getOtcTokens(account?.chainId, 1);
      console.log("OTCCC", res);
      setOtcTokenList(res?.data?.data?.tokens);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function handleAddToken(
    tokenAddress,
    settlementStartDate,
    settlementEndDate,
    tgeDate,
    isEdit,
    addTokenData,
    _id
  ) {
    setLoading(true);
    console.log(
      "heyyyy",
      tokenAddress,
      settlementStartDate,
      settlementEndDate,
      tgeDate,
      isEdit
    );
    try {
      const addTokenHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketABI,
        functionName: isEdit ? "editTimestamps" : "addToken",
        args: [tokenAddress, settlementStartDate, settlementEndDate],
        onError: (error) => {
          console.log("Error while approving:", error);
        },
      });
      console.log("add token Contract", addTokenHash);
      const addTokenConfirmation = await waitForTransactionReceipt(config, {
        hash: addTokenHash,
        chainId: account?.chainId,
        confirmations: 1,
      });

      if (addTokenHash && addTokenConfirmation) {
        console.log("Successsss");
        let val;
        if (isEdit) {
          val = await editPremarketTokens(addTokenData, _id);
        } else {
          val = await addPremarketTokens(addTokenData);
        }
        console.log("Valll", val);
        toast.success(
          isEdit ? "Token edited successfully" : "Token added successfully"
        );
        setIsAddTokenModalOpen(false);
        setIsEdit(false);
        setLoading(false);
        getPremarketTokenList();
        return true;
      } else {
        toast.error("Error while adding token for premarket");
        setIsAddTokenModalOpen(false);
        setIsEdit(false);
        setLoading(false);
        return false;
      }
    } catch (error) {
      toast.error("Error while adding token for premarket");
      setIsAddTokenModalOpen(false);
      setIsEdit(false);
      setLoading(false);
      console.log("Error:: Fail ", error);
      return false;
    }
  }

  async function handleAddCollateralToken(addTokenData) {
    setLoading(true);
    console.log("Lofgggg", addTokenData);
    try {
      console.log("Successsss", addTokenData);
      const val = await addPremarketTokens(addTokenData);
      console.log("Valll", val);
      toast.success("Collateral token added successfully");
      setLoading(false);
      setIsAddTokenModalOpen(false);
      getCollateralTokenList();
    } catch (error) {
      toast.error("Error while adding collateral token");
      setLoading(false);
      setIsAddTokenModalOpen(false);
      console.log("Error:: Fail ", error);
    }
  }

  async function handleAddOtcToken(addTokenData) {
    setLoading(true);
    console.log("Lofgggg", addTokenData);
    try {
      console.log("Successsss", addTokenData);
      const val = await addOtcToken(addTokenData);
      console.log("Valll", val);
      toast.success("OTC token added successfully");
      setLoading(false);
      setIsAddOtcTokenModalOpen(false);
      getOtcTokenList();
    } catch (error) {
      toast.error("Error while adding otc token");
      setLoading(false);
      setIsAddOtcTokenModalOpen(false);
      console.log("Error:: Fail ", error);
    }
  }

  async function handleAddEquityDeal(addTokenData) {
    setLoading(true);
    console.log("Lofgggg", addTokenData);
    try {
      console.log("Successsss", addTokenData);
      const val = await addEquityDeal(addTokenData);
      console.log("Valll", val);
      toast.success("Equity deal added successfully");
      setLoading(false);
      setIsAddEquityDealModalOpen(false);
      getEquityDeals();
    } catch (error) {
      toast.error("Error while adding equity deal");
      setLoading(false);
      setIsAddEquityDealModalOpen(false);
      console.log("Error:: Fail ", error);
    }
  }

  useEffect(() => {
    if (account?.address) {
      getPremarketTokenList();
      getOwnerWalletAddress();
      getCollateralTokenList();
      getOtcTokenList();
      getEquityDeals();
    }
  }, [account?.address]);

  return (
    <div className="px-5 py-4 md:px-8">
      {!account?.address ? (
        <p className="flex items-center justify-center text-xl font-semibold">
          Kindly Connect Your Wallet
        </p>
      ) : dataLoading ? (
        <div className="flex items-center justify-center">
          <Loading bg={"#29BD35"} width={60} height={60} />
        </div>
      ) : false ? (
        <p className="flex items-center justify-center text-xl font-semibold">
          Only admin can access this page
        </p>
      ) : (
        <div className="flex flex-col">
          <div>
            <p className="mb-2 text-xl font-semibold text-baseWhiteDark whitespace-nowrap">
              Commissions
            </p>
            <OfferSection />
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-baseWhiteDark whitespace-nowrap">
                Premarket Tokens
              </p>
              <Button
                variant="PrimaryButton"
                className="!rounded-full whitespace-nowrap py-[10px] justify-center w-fit"
                onClick={() => {
                  setIsCollateral(false);
                  setIsAddTokenModalOpen(true);
                }}
              >
                Add new token
              </Button>
            </div>
            <div>
              <div className="grid items-center w-full grid-cols-10 font-openmarket-general-sans p-[14px] text-sm font-medium">
                <p className="col-span-2">Token</p>
                <p className="col-span-2">Settle Starts</p>
                <p className="col-span-2">Settle Ends</p>
                <p className="col-span-2">TGE</p>
                <p className="col-span-2 justify-self-center">Actions</p>
              </div>
              <div className="flex flex-col gap-y-2">
                {premarketTokens && premarketTokens?.length ? (
                  premarketTokens.map((item, index) => {
                    return (
                      <AdminTableView
                        {...item}
                        key={index}
                        setIsEditModalOpen={() => {
                          setIsEdit(true);
                          setSelectedToken(item);
                        }}
                      />
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-x-16">
            <div className="flex-1 mt-8">
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-baseWhiteDark whitespace-nowrap">
                  OTC Tokens
                </p>
                <Button
                  variant="PrimaryButton"
                  className="!rounded-full whitespace-nowrap py-[10px] justify-center w-fit"
                  onClick={() => {
                    setIsAddOtcTokenModalOpen(true);
                  }}
                >
                  Add new token
                </Button>
              </div>
              <div>
                <div className="grid items-center w-full grid-cols-5 font-openmarket-general-sans p-[14px] text-sm font-medium">
                  <p className="col-span-2">Token</p>
                  <p className="justify-self-center">Price</p>
                  <p className="col-span-2 justify-self-end">Actions</p>
                </div>
                <div className="flex flex-col gap-y-2">
                  {otcTokenList && otcTokenList?.length ? (
                    otcTokenList.map((item, index) => {
                      return (
                        <CollateralTokenTable
                          {...item}
                          key={index}
                          setIsEditModalOpen={() => {
                            setIsEdit(true);
                            setSelectedToken(item);
                          }}
                          isOtc={true}
                        />
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 mt-8">
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-baseWhiteDark whitespace-nowrap">
                  Collateral Tokens
                </p>
                <Button
                  variant="PrimaryButton"
                  className="!rounded-full whitespace-nowrap py-[10px] justify-center w-fit"
                  onClick={() => {
                    setIsCollateral(true);
                    setIsAddTokenModalOpen(true);
                  }}
                >
                  Add new token
                </Button>
              </div>
              <div>
                <div className="grid items-center w-full grid-cols-5 font-openmarket-general-sans p-[14px] text-sm font-medium">
                  <p className="col-span-2">Token</p>
                  <p className="justify-self-center">Price</p>
                  <p className="col-span-2 justify-self-end">Actions</p>
                </div>
                <div className="flex flex-col gap-y-2">
                  {collateralTokenList && collateralTokenList?.length ? (
                    collateralTokenList.map((item, index) => {
                      return (
                        <CollateralTokenTable
                          {...item}
                          key={index}
                          setIsEditModalOpen={() => {
                            setIsEdit(true);
                            setSelectedToken(item);
                          }}
                        />
                      );
                    })
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-baseWhiteDark whitespace-nowrap">
                Equity
              </p>
              <Button
                variant="PrimaryButton"
                className="!rounded-full whitespace-nowrap py-[10px] justify-center w-fit"
                onClick={() => {
                  setIsAddEquityDealModalOpen(true);
                }}
              >
                Add new equity deal
              </Button>
            </div>
            <div>
              <div className="grid items-center w-full grid-cols-11 font-openmarket-general-sans p-[14px] text-sm font-medium">
                <p className="col-span-3">Project Name</p>
                <p className="col-span-2">Round Type</p>
                <p className="col-span-2">Lot FDV</p>
                <p className="col-span-2">Offer size</p>
                <p className="col-span-2">Minimum Bid</p>
              </div>
              <div className="flex flex-col gap-y-2">
                {equityDeals && equityDeals?.length ? (
                  equityDeals.map((item, index) => {
                    return (
                      <EquityDealTableView
                        {...item}
                        isAdmin={true}
                        key={index}
                      />
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
          {isAddEquityDealModalOpen ? (
            <AddEquityDealModal
              closeModal={() => {
                setIsAddEquityDealModalOpen(false);
              }}
              onConfirmClick={handleAddEquityDeal}
              loading={loading}
            />
          ) : (
            <></>
          )}
          {isAddTokenModalOpen ? (
            <AddTokenModal
              closeModal={() => {
                setIsAddTokenModalOpen(false);
              }}
              onConfirmClick={
                isCollateral ? handleAddCollateralToken : handleAddToken
              }
              loading={loading}
              isCollateral={isCollateral}
            />
          ) : (
            <></>
          )}
          {isEdit ? (
            <AddTokenModal
              closeModal={() => {
                setIsEdit(false);
              }}
              onConfirmClick={handleAddToken}
              isEdit={true}
              selectedToken={selectedToken}
              loading={loading}
            />
          ) : (
            <></>
          )}
          {isAddOtcTokenModalOpen ? (
            <AddOtcTokenModal
              closeModal={() => {
                setIsAddOtcTokenModalOpen(false);
              }}
              onConfirmClick={handleAddOtcToken}
              loading={loading}
            />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
