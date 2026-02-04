import React from "react";
import Button from "../common/Button";

function CollateralTokenTable({
  name,
  symbol,
  token_image,
  price,
  setIsEditModalOpen = () => {},
  isOtc = false,
}) {
  return (
    <div className="grid items-center w-full grid-cols-5 bg-baseWhite dark:bg-black font-openmarket-general-sans rounded-[14px] p-[14px] border border-gray300 dark:border-gray300Dark">
      <div className="flex items-center col-span-2 gap-x-2">
        {token_image ? (
          <img
            src={token_image}
            alt="logo"
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <></>
        )}
        <div className="flex flex-col">
          <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
            {name}
          </p>
          <p className="text-xs font-medium text-gray500 dark:text-gray500Dark">
            {symbol}
          </p>
        </div>
      </div>
      <p className="col-span-1 text-sm font-semibold text-theme-green justify-self-center">
        {price || "-"}
      </p>
      <div className="flex col-span-2 justify-self-end gap-x-2">
        {isOtc ? (
          <p>-</p>
        ) : (
          <Button
            variant="PrimaryButton"
            className="!rounded-full"
            onClick={setIsEditModalOpen}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

export default CollateralTokenTable;
