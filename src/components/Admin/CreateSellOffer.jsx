import React, { useEffect, useMemo, useState } from "react";
import Modal from "../common/Modal";
import Loading from "../../assets/icons/loading";
import Button from "../common/Button";
import Dropdown from "../common/Dropdown";
import { useAccount } from "wagmi";
import {
  getPremarketCollateralTokens,
  getPremarketTokens,
} from "../../services/premarket";
import { formatNumber, stringToNumber } from "../../utils";

function CreateSellOffer({
  closeModal,
  onConfirmClick,
  isSell,
  loading = false,
}) {
  const account = useAccount();
  const [offerToken, setOfferToken] = useState("");
  const [priceOfferToken, setPriceOfferToken] = useState("");

  const [selectedToken, setSelectedToken] = useState({});
  const [tokenList, setTokenList] = useState([]);
  const [selectedCollateralToken, setSelectedCollateralToken] = useState({});
  const [collateralTokenList, setCollateralTokenList] = useState([]);

  const numberOfCollateralToken = useMemo(() => {
    console.log("Heree", priceOfferToken, offerToken);
    if (!priceOfferToken || !offerToken) {
      return 0;
    } else {
      return (
        (stringToNumber(priceOfferToken) * stringToNumber(offerToken)) /
        Number(selectedCollateralToken?.price)
      );
    }
  }, [priceOfferToken, offerToken]);

  function handleConfirmClick() {
    onConfirmClick({
      priceOfferToken: stringToNumber(priceOfferToken),
      offerToken: stringToNumber(offerToken),
      selectedToken,
      selectedCollateralToken,
      numberOfCollateralToken: Number(numberOfCollateralToken),
    });
  }

  async function getTokenList() {
    try {
      const res = await getPremarketTokens(account?.chainId);
      const list = [];
      res.data.data.tokens.map((item) => {
        list.push({
          ...item,
          label: item?.symbol,
          logo: <img src={item?.token_image} alt="token logo" />,
        });
      });
      setTokenList(list);
      setSelectedToken(list[0]);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function getCollateralTokenList() {
    try {
      const res = await getPremarketCollateralTokens(account?.chainId);
      console.log("Resssss", res?.data?.data);
      const list = [];
      res.data.data.tokens.map((item) => {
        list.push({
          ...item,
          label: item?.symbol,
          logo: <img src={item?.token_image} alt="token logo" />,
        });
      });
      setCollateralTokenList(list);
      setSelectedCollateralToken(list[0]);
    } catch (err) {
      console.log("Err", err);
    }
  }

  useEffect(() => {
    getTokenList();
    getCollateralTokenList();
  }, []);

  return (
    <Modal
      modalStyle="!w-[90vw] md:!w-[50vw] !min-w-[90vw] md:!min-w-[50vw]"
      closeModal={closeModal}
      isCloseable={!loading}
    >
      <div className="flex flex-col">
        <p className="text-2xl font-semibold text-baseWhiteDark dark:text-baseWhite">
          {isSell
            ? "Create Sell Premarket Offer"
            : "Create Buy Premarket Offer"}
        </p>
        <div className="mt-4 bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] flex flex-col gap-y-4">
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Token Amount
              </p>
              <div className="bg-baseWhite dark:bg-black rounded-full py-[6px] pl-3 pr-[6px] flex justify-between items-center border border-gray300 dark:border-gray300Dark w-full">
                <input
                  placeholder="Enter Amount"
                  type="text"
                  className="w-full text-sm font-medium bg-transparent outline-none text-baseWhiteDark dark:text-baseWhite"
                  onChange={(e) => {
                    const formattedValue = formatNumber(e.target.value);
                    setOfferToken(formattedValue); // Set the formatted value
                  }}
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                  value={offerToken}
                />
                <Dropdown
                  items={tokenList}
                  selectedItem={selectedToken}
                  setSelectedItem={(selectedItem) => {
                    setSelectedToken(selectedItem);
                  }}
                  className={"!w-fit self-end"}
                  containerClassName={
                    "!p-[6px] !text-sm !font-medium !gap-x-1 !bg-transparent"
                  }
                  iconClassName={"!h-4 !w-4"}
                  searchable={true}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Price Per Token
              </p>
              <input
                type="text"
                className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                placeholder="Enter price of offered tokens"
                onChange={(e) => {
                  const formattedValue = formatNumber(e.target.value);
                  setPriceOfferToken(formattedValue); // Set the formatted value
                }}
                value={priceOfferToken}
                onWheel={(e) => {
                  e.target.blur();
                }}
                disabled={loading}
                title={loading ? "Loading..." : ""}
              />
            </div>

            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                {isSell ? "Collateral Token Amount" : "Stable Token Amount"}
              </p>
              <div className="bg-baseWhite dark:bg-black rounded-full py-[6px] pl-3 pr-[6px] flex justify-between items-center border border-gray300 dark:border-gray300Dark w-full">
                <input
                  placeholder="0.00"
                  type="text"
                  className="w-full text-sm font-medium bg-transparent outline-none text-baseWhiteDark dark:text-baseWhite"
                  disabled
                  value={formatNumber(String(numberOfCollateralToken))}
                />
                <Dropdown
                  items={collateralTokenList}
                  selectedItem={selectedCollateralToken}
                  setSelectedItem={(selectedItem) => {
                    setSelectedCollateralToken(selectedItem);
                  }}
                  className={"!w-fit self-end"}
                  containerClassName={
                    "!p-[6px] !text-sm !font-medium !gap-x-1 !bg-transparent"
                  }
                  iconClassName={"!h-4 !w-4"}
                  searchable={true}
                />
              </div>
            </div>
          </div>
        </div>
        <Button
          variant="PrimaryButton"
          className="!rounded-full whitespace-nowrap py-[14px] flex-1 justify-center w-full mt-4"
          onClick={handleConfirmClick}
          disabled={loading}
        >
          {loading ? <Loading /> : "Confirm"}
        </Button>
      </div>
    </Modal>
  );
}

export default CreateSellOffer;
