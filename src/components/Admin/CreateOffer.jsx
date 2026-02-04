import React, { useState } from "react";
import Modal from "../common/Modal";
import Loading from "../../assets/icons/loading";
import { config } from "../../config/contract";
import { erc20Abi } from "viem";
import { readContract } from "wagmi/actions";
import DatePicker from "react-datepicker";
import Button from "../common/Button";

function CreateOffer({
  isEdit = false,
  closeModal,
  onConfirmClick,
  loading = false,
  selectedTrade = {},
}) {
  const [startDate, setStartDate] = useState(
    isEdit && selectedTrade?.start_time
      ? selectedTrade?.start_time * 1000
      : null
  );
  const [endDate, setEndDate] = useState(
    isEdit && selectedTrade?.close_time
      ? selectedTrade?.close_time * 1000
      : null
  );
  const [tgeDate, setTgeDate] = useState(
    isEdit && selectedTrade?.offer_token?.tge
      ? selectedTrade?.offer_token?.tge * 1000
      : null
  );

  const [offerToken, setOfferToken] = useState(
    isEdit && selectedTrade?.total_token ? selectedTrade?.total_token : null
  );
  const [priceOfferToken, setPriceOfferToken] = useState(
    isEdit && selectedTrade?.price_per_token
      ? selectedTrade?.price_per_token
      : null
  );

  const [offerTokenAddress, setOfferTokenAddress] = useState({
    address:
      isEdit && selectedTrade?.offer_token?.token_address
        ? selectedTrade?.offer_token?.token_address
        : "",
    decimals:
      isEdit && selectedTrade?.offer_token?.number_of_decimals
        ? selectedTrade?.offer_token?.number_of_decimals
        : 0,
    name:
      isEdit && selectedTrade?.offer_token?.name
        ? selectedTrade?.offer_token?.name
        : "",
    symbol:
      isEdit && selectedTrade?.offer_token?.symbol
        ? selectedTrade?.offer_token?.symbol
        : "",
  });
  const [receivingTokenAddress, setReceivingTokenAddress] = useState({
    address:
      isEdit && selectedTrade?.receive_token?.token_address
        ? selectedTrade?.receive_token?.token_address
        : "",
    decimals:
      isEdit && selectedTrade?.receive_token?.number_of_decimals
        ? selectedTrade?.receive_token?.number_of_decimals
        : 0,
    name:
      isEdit && selectedTrade?.receive_token?.name
        ? selectedTrade?.receive_token?.name
        : "",
    symbol:
      isEdit && selectedTrade?.receive_token?.symbol
        ? selectedTrade?.receive_token?.symbol
        : "",
  });

  const [startDateInSec, setStartDateInSec] = useState(
    isEdit && selectedTrade?.start_time ? selectedTrade?.start_time : 0
  );
  const [endDateInSec, setEndDateInSec] = useState(
    isEdit && selectedTrade?.close_time ? selectedTrade?.close_time : 0
  );
  const [tgeDateInSec, setTgeDateInSec] = useState(
    isEdit && selectedTrade?.offer_token?.tge
      ? selectedTrade?.offer_token?.tge
      : 0
  );

  async function getTokenData(tokenAddress) {
    const [decimals, name, symbol] = await Promise.all([
      readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
      }),
      readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "name",
      }),
      readContract(config, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      }),
    ]);
    return { decimals, name, symbol };
  }

  async function handleOfferAddress() {
    const { decimals, name, symbol } = await getTokenData(
      offerTokenAddress?.address
    );
    setOfferTokenAddress({
      ...offerTokenAddress,
      decimals: decimals || "",
      name: name || "",
      symbol: symbol || "",
    });
  }

  async function handleReceivingAddress() {
    const { decimals, name, symbol } = await getTokenData(
      receivingTokenAddress?.address
    );
    setReceivingTokenAddress({
      ...receivingTokenAddress,
      decimals: decimals || "",
      name: name || "",
      symbol: symbol || "",
    });
  }

  function handleConfirmClick() {
    if (isEdit) {
      onConfirmClick({
        startDateInSec,
        endDateInSec,
        tgeDateInSec,
        trade_index_from_blockchain: selectedTrade?.trade_index_from_blockchain,
        is_claimed: selectedTrade?.is_claimed,
        is_distributed: selectedTrade?.is_distributed,
        _id: selectedTrade?._id,
      });
    } else {
      onConfirmClick({
        offerTokenAddress,
        receivingTokenAddress,
        startDateInSec,
        endDateInSec,
        tgeDateInSec,
        offerToken,
        priceOfferToken,
      });
    }
  }

  return (
    <Modal
      modalStyle="!w-[90vw] md:!w-[50vw] !min-w-[90vw] md:!min-w-[50vw]"
      closeModal={closeModal}
      isCloseable={!loading}
    >
      <div className="flex flex-col">
        <p className="text-2xl font-semibold text-baseWhiteDark dark:text-baseWhite">
          {isEdit ? "Edit Premarket Order" : "Create New Premarket Offer"}
        </p>
        <div className="mt-4 bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] flex flex-col gap-y-4">
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Offer Token Address
              </p>
              <div className="w-full font-medium text-baseWhiteDark dark:text-baseWhite py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark flex items-center justify-between">
                <input
                  type="text"
                  className="w-full bg-transparent outline-none placeholder:font-normal"
                  placeholder="Enter address of offer token"
                  onChange={(e) => {
                    setOfferTokenAddress({ address: e.target.value });
                  }}
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                  value={offerTokenAddress?.address}
                  disabled={loading || isEdit}
                  title={loading ? "Loading..." : ""}
                />
                <button
                  className="px-2 text-sm border rounded-lg"
                  onClick={() => {
                    handleOfferAddress();
                  }}
                  disabled={isEdit}
                >
                  Submit
                </button>
              </div>
              <div className="grid items-center justify-between grid-cols-3 px-4 text-sm">
                <p>Name: {offerTokenAddress?.name || "-"}</p>
                <p>Symbol: {offerTokenAddress?.symbol || "-"}</p>
                <p>Decimal: {offerTokenAddress?.decimals || "-"}</p>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Receiving Token Address
              </p>
              <div className="w-full font-medium text-baseWhiteDark dark:text-baseWhite py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark flex items-center justify-between">
                <input
                  type="text"
                  className="w-full bg-transparent outline-none placeholder:font-normal"
                  placeholder="Enter address of receiving token"
                  onChange={(e) => {
                    setReceivingTokenAddress({ address: e.target.value });
                  }}
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                  value={receivingTokenAddress?.address}
                  disabled={loading || isEdit}
                  title={loading ? "Loading..." : ""}
                />
                <button
                  className="px-2 text-sm border rounded-lg"
                  onClick={() => {
                    handleReceivingAddress();
                  }}
                  disabled={isEdit}
                >
                  Submit
                </button>
              </div>
              <div className="grid items-center justify-between grid-cols-3 px-4 text-sm">
                <p>Name: {receivingTokenAddress?.name || "-"}</p>
                <p>Symbol: {receivingTokenAddress?.symbol || "-"}</p>
                <p>Decimal: {receivingTokenAddress?.decimals || "-"}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Offer token
              </p>
              <input
                type="number"
                className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-black border-gray300 dark:border-gray300Dark"
                placeholder="Enter number of offered tokens"
                onChange={(e) => {
                  setOfferToken(e.target.value);
                }}
                value={offerToken}
                onWheel={(e) => e.target.blur()}
                disabled={loading || isEdit}
                title={loading ? "Loading..." : ""}
              />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Price of offer token
              </p>
              <input
                type="number"
                className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                placeholder="Enter price of offered tokens"
                onChange={(e) => {
                  setPriceOfferToken(e.target.value);
                }}
                value={priceOfferToken}
                onWheel={(e) => {
                  e.target.blur();
                }}
                disabled={loading || isEdit}
                title={loading ? "Loading..." : ""}
              />
            </div>
          </div>
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Start Date
              </p>
              <div className="w-fit h-fit">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    const timestampInSeconds = Math.floor(
                      date.getTime() / 1000
                    );
                    console.log(timestampInSeconds); // Use this timestamp as needed
                    setStartDate(date);
                    setStartDateInSec(timestampInSeconds);
                  }}
                  mode="single"
                  placeholderText="Select Start Date"
                  // showTimeSelect={true}
                />
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                End Date
              </p>
              <div className="w-fit h-fit">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => {
                    const timestampInSeconds = Math.floor(
                      date.getTime() / 1000
                    );
                    console.log(timestampInSeconds);
                    setEndDate(date);
                    setEndDateInSec(timestampInSeconds);
                  }}
                  mode="single"
                  placeholderText="Select End Date"
                  // showTimeSelect={true}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                TGE Date
              </p>
              <div className="w-fit h-fit">
                <DatePicker
                  selected={tgeDate}
                  onChange={(date) => {
                    const timestampInSeconds = Math.floor(
                      date.getTime() / 1000
                    );
                    console.log(timestampInSeconds);
                    setTgeDate(date);
                    setTgeDateInSec(timestampInSeconds);
                  }}
                  mode="single"
                  placeholderText="Select TGE Date"
                  // showTimeSelect={true}
                />
              </div>
            </div>
            <div className="flex flex-col flex-1"></div>
          </div>
        </div>
        <Button
          variant="PrimaryButton"
          className="!rounded-full whitespace-nowrap py-[14px] flex-1 justify-center w-full mt-4"
          onClick={handleConfirmClick}
          disabled={loading}
        >
          {loading ? <Loading /> : isEdit ? "Save" : "Confirm"}
        </Button>
      </div>
    </Modal>
  );
}

export default CreateOffer;
