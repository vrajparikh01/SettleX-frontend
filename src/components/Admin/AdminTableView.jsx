import React from "react";
import Button from "../common/Button";

function AdminTableView({
  name,
  symbol,
  token_image,
  start_date,
  end_date,
  tge,
  setIsEditModalOpen = () => {},
}) {
  function convertTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  return (
    <div className="grid items-center w-full grid-cols-10 bg-baseWhite dark:bg-black font-openmarket-general-sans rounded-[14px] p-[14px] border border-gray300 dark:border-gray300Dark">
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
      <p className="col-span-2 text-sm font-semibold text-theme-green">
        {start_date ? convertTime(start_date) : "TBA"}
      </p>
      <p className="col-span-2 text-sm font-semibold text-theme-green">
        {end_date ? convertTime(end_date) : "TBA"}
      </p>
      <p className="col-span-2 text-sm font-semibold text-theme-green">
        {tge ? convertTime(tge) : "TBA"}
      </p>
      <div className="flex col-span-2 justify-self-center gap-x-2">
        <Button
          variant="PrimaryButton"
          className="!rounded-full"
          onClick={setIsEditModalOpen}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

export default AdminTableView;
