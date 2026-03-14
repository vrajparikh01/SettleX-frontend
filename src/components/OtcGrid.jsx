import React from "react";
import { ArrowRight, EyeGrayIcon, ShuffleIcon } from "../assets/icons";
import { useNavigate } from "react-router-dom";
import Button from "./common/Button";
import LavaLogo from "../assets/images/LavaLogo.png";
import CircularProgress from "./common/CircularProgress";
import { formatStringToNumber } from "../utils";
import EnsDisplay from "./common/EnsDisplay";
import EnsSocialProfile from "./common/EnsSocialProfile";
import EnsReputationBadge from "./common/EnsReputationBadge";
import { useEnsProfile } from "../hooks/useEns";

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
  trader_wallet_address,
  user_wallet = "",
  onButtonClick = () => {},
  // A3: hide card if trader has no ENS name (ENS-only filter mode)
  hideIfNoEns = false,
  // A8: highlight border if trade matches user's settlex.prefs tokens
  highlightMatch = false,
}) {
  const navigate = useNavigate();
  // A3: resolve ENS for filter — wagmi deduplicates this call with EnsDisplay's call
  const { ensName, isLoading: ensLoading } = useEnsProfile(receiver_wallet_address);
  if (hideIfNoEns && !ensLoading && !ensName) return null;

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
      className={`items-center w-full bg-baseWhite dark:bg-black border font-openmarket-general-sans rounded-[20px] p-[14px] cursor-pointer transition-all ${
        highlightMatch
          ? "border-theme-green shadow-[0_0_0_1px_rgba(34,197,94,0.3)]"
          : "border-gray300 dark:border-gray300Dark"
      }`}
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
          <div className="flex flex-col gap-y-[3px]">
            {/* Feature 4A: creator.eth → receiver.eth */}
            <div className="flex items-center gap-x-1 flex-wrap gap-y-1">
              {trader_wallet_address && (
                <EnsDisplay
                  address={trader_wallet_address}
                  showAvatar={true}
                  avatarClassName="w-4 h-4"
                  className="text-xs"
                />
              )}
              {trader_wallet_address && receiver_wallet_address && (
                <span className="text-[10px] text-gray500 dark:text-gray500Dark">→</span>
              )}
              {receiver_wallet_address && (
                <>
                  <EnsDisplay
                    address={receiver_wallet_address}
                    showAvatar={true}
                    avatarClassName="w-4 h-4"
                    className="text-xs"
                  />
                  <EnsReputationBadge
                    address={receiver_wallet_address}
                    compact={true}
                  />
                </>
              )}
            </div>
            {receiver_wallet_address && (
              <EnsSocialProfile
                address={receiver_wallet_address}
                compact={true}
                className="ml-0"
              />
            )}
          </div>
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
