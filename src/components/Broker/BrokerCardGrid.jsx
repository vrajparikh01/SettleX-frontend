import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import CustomSlider from "../common/CustomSlider";
import { HeartIcon } from "../../assets/icons";
import CircularProgress from "../common/CircularProgress";

function BrokerCardGrid({
  logo = "",
  value = "",
  hash = "",
  amount = "",
  isSelected = false,
  isBuy = true,
  tokenAgreement = "",
  targetValuation = "",
  distribution = "",
  minInvestment = "",
}) {
  const navigate = useNavigate();

  return (
    <div
      className="items-center w-full bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark font-openmarket-general-sans rounded-[20px] p-[14px] cursor-pointer"
      // onClick={() => {
      //   console.log("Here");
      //   navigate("/otc/details");
      // }}
    >
      <div className="flex items-center justify-between pb-4 border-b border-gray300 dark:border-gray300Dark">
        <div className="flex items-center gap-x-3">
          {logo ? <img src={logo} alt="logo" className="w-12 h-12" /> : <></>}
          <div>
            <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
              {value}
            </p>
            <p className="text-xs font-semibold text-gray500 dark:text-gray500Dark">
              {hash}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
            {amount}
          </p>
          <p className="text-sm font-semibold text-[#5F61F0]">
            {tokenAgreement}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm font-semibold gap-x-2">
        <p className="text-xs font-medium text-gray500 dark:text-gray500Dark">
          $10 Lot FDV
        </p>
        <div className="flex items-center gap-x-[10px]">
          <CircularProgress />
          <Button
            variant="PrimaryButton"
            className={`!rounded-[90px] w-fit justify-center py-1 px-5 ${
              !isBuy ? "bg-red-gradient text-white" : ""
            }`}
          >
            {isBuy ? "Buy" : "Sell"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BrokerCardGrid;
