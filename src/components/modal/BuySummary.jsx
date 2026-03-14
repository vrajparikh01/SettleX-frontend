import React, { useMemo, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import LavaLogo from "../../assets/images/LavaLogo.png";
import CircularProgress from "../common/CircularProgress";
import CustomSlider from "../common/CustomSlider";
import { useAccount } from "wagmi";
import ConnectWalletButton from "../common/ConnectWalletButton";
import Loading from "../../assets/icons/loading";
import EnsTraderCard from "../common/EnsTraderCard";

function BuySummary({
  available_token,
  filled_token_amount,
  completion_percentage,
  total_token,
  number_of_token_require,
  price_per_token,
  offer_token,
  receive_token,
  lot_size = 1,
  closeModal,
  onConfirmClick,
  isPremarket = false,
  loading = false,
  start_date,
  end_date,
  tge,
  receiver_wallet_address,
}) {
  const account = useAccount();
  const [value, setValue] = useState(100); // Default value for the slider
  const numberOfTokenByUser = useMemo(() => {
    return (value * available_token) / 100;
  }, [value]);

  const collateralTokenInDollar = useMemo(() => {
    return numberOfTokenByUser * price_per_token;
  }, [numberOfTokenByUser]);

  const collateralTokenCount = useMemo(() => {
    return collateralTokenInDollar / receive_token?.price;
  }, [collateralTokenInDollar]);

  function convertTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  return (
    <Modal
      closeModal={closeModal}
      modalStyle="!w-[90vw] md:!w-[65vw] !min-w-[90vw] md:!min-w-[65vw]"
      isCloseable={!loading}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-x-4">
          <p className="text-xl font-semibold md:text-2xl text-baseWhiteDark dark:text-baseWhite">
            Buy Allocation
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-x-5 mt-4 md:mt-7 gap-y-[10px]">
          <div className="p-[10px] md:p-5 bg-gray100 dark:bg-gray100Dark rounded-2xl flex-[6]">
            <div className="">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                  <img
                    src={offer_token?.token_image || LavaLogo}
                    alt="img"
                    className="w-10 h-10 md:w-[60px] md:h-[60px] rounded-full"
                  />
                  <div>
                    <p className="text-lg font-semibold text-baseWhiteDark dark:text-baseWhite">
                      {offer_token?.name}
                    </p>
                    <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                      {offer_token?.symbol}
                    </p>
                  </div>
                </div>
                <CircularProgress percentage={completion_percentage} />
              </div>
              <p className="mt-[10px] md:mt-5 text-sm font-medium text-gray500 dark:text-gray500Dark">
                Your action
              </p>
              <div className="flex flex-col p-4 mt-2 text-sm font-medium border bg-baseWhite dark:bg-black rounded-xl border-gray300 dark:border-gray300Dark">
                <p className="px-4 py-1 text-sm font-medium rounded-full text-theme-green bg-theme-green/10 w-fit">
                  Buying
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="font-semibold text-xl md:text-[32px] md:leading-[44px] text-baseWhiteDark dark:text-baseWhite">
                    {Number(numberOfTokenByUser?.toFixed(6))}
                  </p>
                  <p className="font-semibold text-xl md:text-[32px] md:leading-[44px] text-baseWhiteDark dark:text-baseWhite">
                    {offer_token?.symbol}
                  </p>
                  {/* <img src={LavaLogo} alt="logo" className="w-6 h-6" /> */}
                </div>
                <div className="mt-1 md:mt-5">
                  <CustomSlider
                    value={value}
                    setValue={setValue}
                    disabled={!lot_size || loading}
                  />
                </div>
              </div>
              <div className="flex flex-col p-4 mt-2 text-sm font-medium border md:mt-4 bg-baseWhite dark:bg-black rounded-xl border-gray300 dark:border-gray300Dark gap-y-1 md:gap-y-2">
                <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                  Pay Amount
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xl md:text-[32px] md:leading-[44px] text-baseWhiteDark dark:text-baseWhite">
                    {Number(collateralTokenCount?.toFixed(6))}
                  </p>
                  <p className="font-semibold text-xl md:text-[32px] md:leading-[44px] text-baseWhiteDark dark:text-baseWhite">
                    {receive_token?.symbol}
                  </p>
                  {/* <img src={LavaLogo} alt="logo" className="w-6 h-6" /> */}
                </div>
                <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                  ${Number(collateralTokenInDollar?.toFixed(6))}{" "}
                </p>
              </div>
            </div>
            {account?.isConnected ? (
              <Button
                variant="PrimaryButton"
                className="!rounded-full whitespace-nowrap py-3 flex-1 justify-center w-full mt-[10px] md:mt-7"
                onClick={() => {
                  onConfirmClick(numberOfTokenByUser, collateralTokenCount);
                }}
                disabled={numberOfTokenByUser <= 0 || loading}
              >
                {loading ? <Loading /> : "Confirm"}
              </Button>
            ) : (
              <div className="mt-[10px] md:mt-7">
                <ConnectWalletButton fullVariant={true} />
              </div>
            )}
          </div>
          <div className="p-5 bg-gray100 dark:bg-gray100Dark rounded-2xl flex-[4]">
            <p className="mb-4 text-lg font-semibold text-baseWhiteDark dark:text-baseWhite">
              Offer details
            </p>
            {receiver_wallet_address && (
              <div className="mb-5 pb-5 border-b border-gray300 dark:border-gray300Dark">
                <p className="text-xs font-medium text-gray500 dark:text-gray500Dark mb-2">
                  Seller
                </p>
                <EnsTraderCard address={receiver_wallet_address} label="Seller" />
              </div>
            )}
            <div className="flex flex-col gap-y-5 md:gap-y-[22px]">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray500 dark:text-gray500Dark">
                  Offer
                </p>
                <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                  {total_token} {offer_token?.symbol}
                  {/* <span>
                    <img
                      src={LavaLogo}
                      alt="logo"
                      className="inline-block w-5 h-5 ml-[6px]"
                    />
                  </span> */}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray500 dark:text-gray500Dark">
                  For
                </p>
                <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                  {Number(number_of_token_require?.toFixed(6))}{" "}
                  {receive_token?.symbol}
                  {/* <span>
                    <img
                      src={LavaLogo}
                      alt="logo"
                      className="inline-block w-5 h-5 ml-[6px]"
                    />
                  </span> */}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray500 dark:text-gray500Dark">
                  Price/Token
                </p>
                <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                  ${price_per_token}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray500 dark:text-gray500Dark">
                  Fill Type
                </p>
                <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                  {lot_size ? "Partial Fill" : "Complete Fill"}
                </p>
              </div>
              {/* <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray500 dark:text-gray500Dark">
                  Privacy
                </p>
                <p className="font-semibold text-theme-red">Public</p>
              </div> */}
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray500 dark:text-gray500Dark">
                  Filled Amount
                </p>
                <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                  {Number(filled_token_amount?.toFixed(6))}{" "}
                  {offer_token?.symbol}
                  {/* <span>
                    <img
                      src={LavaLogo}
                      alt="logo"
                      className="inline-block w-5 h-5 ml-[6px]"
                    />
                  </span> */}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray500 dark:text-gray500Dark">
                  Remaining Amount
                </p>
                <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                  {Number(available_token?.toFixed(6))} {offer_token?.symbol}
                  {/* <span>
                    <img
                      src={LavaLogo}
                      alt="logo"
                      className="inline-block w-5 h-5 ml-[6px]"
                    />
                  </span> */}
                </p>
              </div>
              {isPremarket && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray500 dark:text-gray500Dark">
                      Settlement Start Date
                    </p>
                    <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                      {start_date ? convertTime(start_date) : "TBA"}{" "}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray500 dark:text-gray500Dark">
                      Settlement End Date
                    </p>
                    <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                      {end_date ? convertTime(end_date) : "TBA"}{" "}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray500 dark:text-gray500Dark">
                      TGE Date
                    </p>
                    <p className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                      {tge ? convertTime(tge) : "TBA"}{" "}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default BuySummary;
