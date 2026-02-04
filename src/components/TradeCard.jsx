import React from "react";

function TradeCard({ logo = "", title = "", amount = "" }) {
  return (
    <div className="flex items-center gap-x-3">
      {logo ? (
        <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
      ) : (
        <></>
      )}
      <div className="flex flex-col">
        {title ? (
          <p className="text-base font-medium whitespace-nowrap">{title}</p>
        ) : (
          <></>
        )}
        {amount ? (
          <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
            {amount}
          </p>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default TradeCard;
