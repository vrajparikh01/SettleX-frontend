import React from "react";
import { ArrowRight, EyeGrayIcon, ShuffleIcon } from "../assets/icons";
import { useNavigate } from "react-router-dom";
import Button from "./common/Button";
import LavaLogo from "../assets/images/LavaLogo.png";
import CircularProgress from "./common/CircularProgress";
import { formatStringToNumber } from "../utils";
import EnsDisplay from "./common/EnsDisplay";

function OtcGrid({
  _id = "",
  available_token,
  completion_percentage,
  total_token,
  number_of_token_require,
  price_per_token,
  offer_token,
  receive_token,
  view_count,
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
      className="items-center w-full bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark font-openmarket-general-sans rounded-[20px] p-[14px] cursor-pointer"
      onClick={handleGridClick}
    >
      <div className="flex items-center flex-1 gap-x-2">
        {true ? (
          <img
            src={offer_token?.token_image || LavaLogo}
            alt="logo"
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <></>
        )}
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-base leading-[22px] font-semibold text-baseWhiteDark dark:text-baseWhite">
              {formatStringToNumber(total_token)}
            </p>
            <p className="text-xs font-medium leading-4 text-gray500 dark:text-gray500Dark">
              ${price_per_token}/{offer_token?.symbol}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-base leading-[22px] font-semibold text-baseWhiteDark dark:text-baseWhite">
              {formatStringToNumber(
                Number(number_of_token_require?.toFixed(6))
              )}
            </p>
            <p className="flex items-center text-xs font-medium leading-4 text-gray500 dark:text-gray500Dark gap-x-1">
              <span className="block w-4 h-4">
                <ShuffleIcon />
              </span>
              {receive_token?.symbol}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-[10px] mt-[10px] border-t border-gray300 dark:border-gray300Dark">
        <div className="flex items-center gap-x-2">
          <CircularProgress percentage={completion_percentage} />
          {receiver_wallet_address && (
            <EnsDisplay 
              address={receiver_wallet_address}
              showAvatar={true}
              avatarClassName="w-5 h-5"
              className="text-xs"
            />
          )}
        </div>
        <div className="flex items-center gap-x-[10px]">
          <p className="text-sm font-medium text-gray500 dark:text-gray500Dark font-openmarket-general-sans flex items-center gap-x-[6px]">
            <span className="block w-4 h-4">
              <EyeGrayIcon />
            </span>
            {view_count}
          </p>
          {showBuySell ? (
            isBuy ? (
              <Button
                variant="PrimaryButton"
                className="!rounded-full"
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
                className="!rounded-full !bg-red-gradient !text-white"
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
            <Button
              variant="TransparentButton"
              className="!rounded-full !justify-self-end"
              // onClick={handleButtonClick}
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtcGrid;
