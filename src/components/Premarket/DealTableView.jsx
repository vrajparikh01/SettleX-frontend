import React from "react";
import Button from "../common/Button";
import { EyeGrayIcon, ShuffleIcon } from "../../assets/icons";
import LavaLogo from "../../assets/images/LavaLogo.png";
import CircularProgress from "../common/CircularProgress";
import { formatStringToNumber } from "../../utils";

function DealTableView({
  total_token,
  available_token,
  completion_percentage,
  number_of_token_require,
  price_per_token,
  offer_token,
  receive_token,
  start_date,
  end_date,
  tge,
  isBuy,
  onButtonClick = () => {},
}) {
  function convertTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  const currentDate = Math.floor(new Date().getTime() / 1000);

  return (
    <div className="grid items-center w-full grid-cols-13 bg-baseWhite dark:bg-black font-openmarket-general-sans rounded-[14px] p-[14px] border border-gray300 dark:border-gray300Dark">
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
      <div className="flex flex-col col-span-2">
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
      <p className="col-span-2 text-sm font-medium text-gray500 dark:text-gray500Dark font-openmarket-general-sans flex items-center gap-x-[6px]">
        <span>
          <EyeGrayIcon />
        </span>{" "}
        5626
      </p>
      <div className="col-span-1">
        <CircularProgress percentage={completion_percentage} />
      </div>
      {isBuy ? (
        <Button
          variant="PrimaryButton"
          className="!rounded-full col-span-2 justify-self-end"
          onClick={onButtonClick}
          disabled={completion_percentage == 100 || (tge && currentDate > tge)}
        >
          Buy
        </Button>
      ) : (
        <Button
          variant="PrimaryButton"
          className="!rounded-full col-span-2 justify-self-end !bg-red-gradient !text-white"
          onClick={onButtonClick}
          disabled={completion_percentage == 100 || (tge && currentDate > tge)}
        >
          Sell
        </Button>
      )}
    </div>
  );
}

export default DealTableView;
