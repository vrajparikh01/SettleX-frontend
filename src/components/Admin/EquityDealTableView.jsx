import React from "react";
import Button from "../common/Button";
import { formatStringToNumber } from "../../utils";

function EquityDealTableView({
  name,
  logo,
  fdv,
  minimum_bid,
  offered_amount,
  round_type,
  isAdmin = false,
  handleInvest = () => {},
}) {
  return (
    <div
      className={`grid items-center w-full ${
        !isAdmin ? "grid-cols-13" : "grid-cols-11"
      } bg-baseWhite dark:bg-black font-openmarket-general-sans rounded-[14px] p-[14px] border border-gray300 dark:border-gray300Dark`}
    >
      <div className="flex items-center col-span-3 gap-x-2">
        {logo ? (
          <img src={logo} alt="logo" className="w-12 h-12 rounded-full" />
        ) : (
          <></>
        )}
        <p className="flex flex-col text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
          {name}
        </p>
      </div>
      <p className="col-span-2 text-sm font-semibold text-theme-green">
        {round_type}
      </p>
      <p className="col-span-2 text-sm font-semibold text-theme-green">
        ${formatStringToNumber(fdv)}
      </p>
      <p className="col-span-2 text-sm font-semibold text-theme-green">
        ${formatStringToNumber(offered_amount)}
      </p>
      <p className="col-span-2 text-sm font-semibold text-theme-green">
        ${formatStringToNumber(minimum_bid)}
      </p>
      {!isAdmin ? (
        <div className="flex col-span-2 gap-x-2">
          <Button
            variant="PrimaryButton"
            className="!rounded-full"
            onClick={handleInvest}
          >
            Invest
          </Button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default EquityDealTableView;
