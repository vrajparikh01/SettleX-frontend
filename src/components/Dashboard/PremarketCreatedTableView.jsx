import React, { useState } from "react";
import Button from "../common/Button";
import { ShuffleIcon } from "../../assets/icons";
import LavaLogo from "../../assets/images/LavaLogo.png";
import CircularProgress from "../common/CircularProgress";
import Loading from "../../assets/icons/loading";
import CancelConfirmationModal from "../modal/CancelConfirmationModal";
import { formatStringToNumber } from "../../utils";

function PremarketCreatedTableView({
  total_token,
  completion_percentage,
  number_of_token_require,
  price_per_token,
  offer_token,
  receive_token,
  start_date,
  end_date,
  tge,
  trade_index_from_blockchain,
  loading,
  is_distributed,
  is_claimed,
  trade_type,
  is_untraded_claimed,
  handleDistribute = () => {},
  handleCancel = () => {},
  handleDelete = () => {},
  handleClaimBackUntradedAmount = () => {},
}) {
  function convertTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  const currentDate = Math.floor(new Date().getTime() / 1000);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="flex flex-col rounded-[14px] border border-gray300 dark:border-gray300Dark overflow-hidden">
      <div className="grid items-center w-full grid-cols-10 bg-baseWhite dark:bg-black font-openmarket-general-sans py-[14px] px-2">
        <div className="flex items-center col-span-2 gap-x-2">
          <img
            src={offer_token?.token_image || LavaLogo}
            alt="logo"
            className="w-12 h-12 rounded-full"
          />
          <div className="flex flex-col">
            <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
              {formatStringToNumber(total_token)}
            </p>
            <p className="text-xs font-medium text-gray500 dark:text-gray500Dark">
              ${price_per_token}/{offer_token?.symbol}
            </p>
          </div>
        </div>
        <div className="flex flex-col col-span-1">
          <p className="text-sm font-semibold text-baseWhiteDark dark:text-baseWhite">
            {formatStringToNumber(number_of_token_require)}
          </p>
          <p className="flex items-center text-xs font-medium text-gray500 dark:text-gray500Dark gap-x-1">
            <ShuffleIcon />
            {receive_token?.symbol}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-semibold text-theme-green">
            {start_date ? convertTime(start_date) : "TBA"}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-semibold text-theme-green">
            {end_date ? convertTime(end_date) : "TBA"}
          </p>
        </div>
        <div className="col-span-1">
          <CircularProgress percentage={completion_percentage} />
        </div>
        <div className="flex justify-center col-span-2 gap-x-1">
          {trade_type ? (
            is_claimed ? (
              <p className="text-sm font-semibold">Cancelled</p>
            ) : (
              <Button
                variant="PrimaryButton"
                className="!rounded-full !bg-red-gradient !text-white"
                onClick={() => {
                  handleCancel(trade_index_from_blockchain);
                }}
                disabled={
                  new Date().getTime() / 1000 < tge + 24 * 60 * 60 || loading
                }
              >
                {loading ? <Loading /> : "Claim"}
              </Button>
            )
          ) : is_distributed ? (
            <p className="text-sm font-semibold">Distributed</p>
          ) : (
            <Button
              variant="PrimaryButton"
              className="!rounded-full"
              onClick={() => {
                handleDistribute(trade_index_from_blockchain);
              }}
              disabled={
                new Date().getTime() / 1000 < tge ||
                new Date().getTime() / 1000 > tge + 24 * 60 * 60 ||
                loading
              }
            >
              {loading ? <Loading /> : "Distribute"}
            </Button>
          )}
        </div>
      </div>
      {completion_percentage == 0 ? (
        <div className="flex justify-center px-2 py-1 text-sm font-medium bg-light-gradient dark:bg-light-gradientDark gap-x-1">
          No contribution yet. Do you want to cancel the offer?{" "}
          <button
            className="font-semibold underline"
            onClick={() => {
              // handleDelete(trade_index_from_blockchain);
              setConfirmDelete(true);
            }}
          >
            {" "}
            Cancel
          </button>
        </div>
      ) : currentDate > tge &&
        completion_percentage < 100 &&
        trade_type == 1 &&
        !is_untraded_claimed ? (
        <div className="flex justify-center px-2 py-1 text-sm font-medium bg-light-gradient dark:bg-light-gradientDark gap-x-1">
          Get back your stable token for the un-invested part of deal.{" "}
          <button
            className="font-semibold underline"
            onClick={() => {
              handleClaimBackUntradedAmount(trade_index_from_blockchain);
            }}
          >
            {" "}
            Claim
          </button>
        </div>
      ) : currentDate > tge &&
        completion_percentage < 100 &&
        is_untraded_claimed ? (
        <div className="flex justify-center px-2 py-1 text-sm font-medium bg-light-gradient dark:bg-light-gradientDark gap-x-1">
          You have claimed back the un-invested part of deal successfully!
        </div>
      ) : (
        <></>
      )}
      {confirmDelete ? (
        <CancelConfirmationModal
          closeModal={() => {
            setConfirmDelete(false);
          }}
          confirmFunction={() => {
            handleDelete(trade_index_from_blockchain);
            setConfirmDelete(false);
          }}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default PremarketCreatedTableView;
