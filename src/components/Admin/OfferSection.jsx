import React, { useEffect, useState } from "react";
import { CrossIcon } from "../../assets/icons";
import Button from "../common/Button";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import PremarketAbi from "../../contract/premarketAbi.json";
import OTCAbi from "../../contract/otcAbi.json";
import { otc_contract, premarket_contract } from "../../config/contract";
import { toast } from "react-toastify";
import LoadingModal from "../modal/LoadingModal";

function OfferSection() {
  const { writeContractAsync } = useWriteContract();

  const account = useAccount();
  const config = useConfig();

  const [premarketCommissionEdit, setPremarketCommissionEdit] = useState(false);
  const [otcCommissionEdit, setOtcCommissionEdit] = useState(false);
  const [premarketCommissionPercentage, setPremarketCommissionPercentage] =
    useState();
  const [
    editPremarketCommissionPercentage,
    setEditPremarketCommissionPercentage,
  ] = useState();
  const [otcCommissionPercentage, setOtcCommissionPercentage] = useState();
  const [editOtcCommissionPercentage, setEditOtcCommissionPercentage] =
    useState();
  const [loadingCommission, setLoadingCommission] = useState(false);

  async function getPremarketCommission() {
    try {
      const commission = await readContract(config, {
        address: premarket_contract(account?.chainId),
        abi: PremarketAbi,
        functionName: "getCommissionPercentage",
        args: [],
      });
      console.log("Commission", commission);
      if (commission) {
        setPremarketCommissionPercentage(Number(commission));
        setEditPremarketCommissionPercentage(Number(commission));
        return true;
      }
    } catch (error) {
      console.log("Error:: Premarket Commission ", error);
      return false;
    }
  }

  async function updatePremarketCommission() {
    setLoadingCommission(true);
    try {
      const commissionContractHash = await writeContractAsync({
        address: premarket_contract(account?.chainId),
        abi: PremarketAbi,
        functionName: "setCommission",
        args: [editPremarketCommissionPercentage],
      });
      console.log("Commission", commissionContractHash);
      const approveConfirmation = await waitForTransactionReceipt(config, {
        hash: commissionContractHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      if (commissionContractHash && approveConfirmation) {
        toast.success("Commission updated successfully");
        getPremarketCommission();
        setPremarketCommissionEdit(false);
        setLoadingCommission(false);
      }
    } catch (error) {
      console.log(
        "Error:: Premarket Commission ",
        error,
        Object.keys(error),
        Object.values(error)
      );
      toast.error("Error while updating the commission.");
      setPremarketCommissionEdit(false);
      setLoadingCommission(false);
      return false;
    }
  }

  async function getOtcCommission() {
    try {
      const commission = await readContract(config, {
        address: otc_contract(account?.chainId),
        abi: OTCAbi,
        functionName: "getCommissionInformation",
        args: [],
      });
      console.log("OTC Commission", commission);
      if (commission) {
        setOtcCommissionPercentage(Number([commission[1]]));
        setEditOtcCommissionPercentage(Number(commission[1]));
        return true;
      }
    } catch (error) {
      console.log("Error:: Premarket Commission ", error);
      return false;
    }
  }

  async function updateOTCCommission() {
    setLoadingCommission(true);
    try {
      const commissionContractHash = await writeContractAsync({
        address: otc_contract(account?.chainId),
        abi: OTCAbi,
        functionName: "setCommissionToken",
        args: [1, editOtcCommissionPercentage],
      });
      console.log("OTC Commission", commissionContractHash);
      const approveConfirmation = await waitForTransactionReceipt(config, {
        hash: commissionContractHash,
        chainId: account?.chainId,
        confirmations: 1,
      });
      if (commissionContractHash && approveConfirmation) {
        toast.success("Commission updated successfully");
        getOtcCommission();
        setOtcCommissionEdit(false);
        setLoadingCommission(false);
      }
    } catch (error) {
      console.log(
        "Error:: OTC Commission ",
        error,
        Object.keys(error),
        Object.values(error)
      );
      toast.error("Error while updating the commission.");
      setOtcCommissionEdit(false);
      return false;
    }
  }

  useEffect(() => {
    if (account?.address) {
      getPremarketCommission();
      getOtcCommission();
    }
  }, [account?.address]);

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-4">
      <div className="flex items-center flex-1 gap-x-2">
        <p className="text-base font-medium text-baseWhiteDark whitespace-nowrap">
          Premarket Commission:
        </p>
        {premarketCommissionEdit ? (
          <>
            <input
              type="number"
              className="px-3 py-2 text-sm font-medium border rounded-full outline-none w-fit text-baseWhiteDark dark:text-baseWhite placeholder:font-normal bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Premarket Commission"
              onChange={(e) => {
                setEditPremarketCommissionPercentage(e.target.value);
              }}
              value={editPremarketCommissionPercentage}
              onWheel={(e) => {
                e.target.blur();
              }}
            />
            <Button
              variant="PrimaryButton"
              onClick={() => {
                updatePremarketCommission();
              }}
            >
              Update
            </Button>
            <button
              onClick={() => {
                setPremarketCommissionEdit(false);
              }}
            >
              <CrossIcon />
            </button>
          </>
        ) : (
          <>
            <span className="py-2 font-semibold">
              {premarketCommissionPercentage || `-`}
            </span>
            <button
              className="text-sm font-medium underline text-blue300"
              onClick={() => {
                setPremarketCommissionEdit(true);
              }}
            >
              Edit
            </button>
          </>
        )}
      </div>
      <div className="flex items-center flex-1 gap-x-2">
        <p className="text-base font-medium text-baseWhiteDark whitespace-nowrap">
          OTC/OTC Broker Commission:{" "}
        </p>
        {otcCommissionEdit ? (
          <>
            <input
              type="number"
              className="px-3 py-2 text-sm font-medium border rounded-full outline-none w-fit text-baseWhiteDark dark:text-baseWhite placeholder:font-normal bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="OTC Commission"
              onChange={(e) => {
                setEditOtcCommissionPercentage(e.target.value);
              }}
              value={editOtcCommissionPercentage}
              onWheel={(e) => {
                e.target.blur();
              }}
            />
            <Button
              variant="PrimaryButton"
              onClick={() => {
                updateOTCCommission();
              }}
            >
              Update
            </Button>
            <button
              onClick={() => {
                setOtcCommissionEdit(false);
              }}
            >
              <CrossIcon />
            </button>
          </>
        ) : (
          <>
            <span className="py-2 font-semibold">
              {otcCommissionPercentage || `-`}
            </span>
            <button
              className="text-sm font-medium underline text-blue300"
              onClick={() => {
                setOtcCommissionEdit(true);
              }}
            >
              Edit
            </button>
          </>
        )}
      </div>
      {loadingCommission ? <LoadingModal /> : <></>}
    </div>
  );
}

export default OfferSection;
