import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./common/Button";
import CircularProgress from "./common/CircularProgress";
import { EyeGrayIcon, ShuffleIcon } from "../assets/icons";
import { formatStringToNumber } from "../utils";
import LavaLogo from "../assets/images/LavaLogo.png";
import EnsDisplay from "./common/EnsDisplay";

function OtcList({
  _id = "",
  available_token,
  completion_percentage,
  total_token,
  number_of_token_require,
  price_per_token,
  offer_token,
  receive_token,
  view_count,
  lot_size,
  trade_type,
  redirect = true,
  isBuy = false,
  showBuySell = true,
  receiver_wallet_address,
  user_wallet = "",
  onButtonClick = () => {},
}) {
  const navigate = useNavigate();

  const handleGridClick = () => {
    // if (redirect) {
    //   navigate(`/otc/details?id=${offer_token?._id}&viewId=${_id}`);
    // }
  };

  const handleButtonClick = (event) => {
    event.stopPropagation(); // Prevent click event from bubbling up
    onButtonClick();
  };

  return (
    <div
      className={`grid items-center w-full bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark font-openmarket-general-sans rounded-[20px] py-[14px] px-[14px] cursor-pointer ${
        showBuySell ? "grid-cols-7" : "grid-cols-8"
      }`}
      onClick={handleGridClick}
    >
      <div className="flex items-center col-span-2 gap-x-3">
        <img
          src={offer_token?.token_image || LavaLogo}
          alt="logo"
          className="w-12 h-12"
        />
        <div className="flex flex-col">
          <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
            {formatStringToNumber(total_token)}
          </p>
          <p className="text-xs font-medium leading-4 text-gray500 dark:text-gray500Dark">
            ${price_per_token}/{offer_token?.symbol}
          </p>
        </div>
      </div>
      <div className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
        <p>
          {formatStringToNumber(Number(number_of_token_require?.toFixed(6)))}
        </p>
        <p className="flex items-center text-xs font-medium text-gray500 dark:text-gray500Dark gap-x-1">
          <ShuffleIcon /> {receive_token?.symbol}
        </p>
      </div>
      <div className="col-span-2">
        {receiver_wallet_address && (
          <EnsDisplay 
            address={receiver_wallet_address}
            showAvatar={true}
            showAddress={false}
            avatarClassName="w-6 h-6"
            className="text-sm"
          />
        )}
      </div>
      <p className="text-sm font-medium flex gap-x-[6px] items-center text-gray500 dark:text-gray500Dark">
        <EyeGrayIcon /> {view_count}
      </p>
      <div className="text-sm font-medium text-gray500 dark:text-gray500Dark">
        <CircularProgress percentage={completion_percentage} />
      </div>
      {!showBuySell && (
        <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
          {trade_type ? "Sell" : "Buy"}
        </p>
      )}
      {showBuySell ? (
        isBuy ? (
          <Button
            variant="PrimaryButton"
            className="!rounded-full !justify-self-end"
            onClick={handleButtonClick}
            disabled={
              completion_percentage >= 100 ||
              receiver_wallet_address == user_wallet
            }
          >
            Buy
          </Button>
        ) : (
          <Button
            variant="PrimaryButton"
            className="!rounded-full !bg-red-gradient !justify-self-end !text-white"
            onClick={handleButtonClick}
            disabled={
              completion_percentage >= 100 ||
              receiver_wallet_address == user_wallet
            }
          >
            Sell
          </Button>
        )
      ) : (
        <p className="text-sm font-medium flex gap-x-[6px] items-center text-gray500 dark:text-gray500Dark justify-self-center">
          {lot_size ? "Partial" : "Full"}
        </p>
      )}
    </div>
  );
}

export default OtcList;
