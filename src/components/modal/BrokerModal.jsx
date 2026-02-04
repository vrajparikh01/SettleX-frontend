import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Dropdown from "../common/Dropdown";
import { getTokenDetails, getTokens } from "../../services/otc";
import { lotSize } from "../../constants/common";
import { useAccount } from "wagmi";
import Loading from "../../assets/icons/loading";
import { formatNumber, stringToNumber } from "../../utils";

function BrokerModal({ closeModal, onConfirmClick, loading = false, isSell }) {
  const account = useAccount();
  const [selectedLotSize, setSelectedLotSize] = useState(lotSize[0]);

  const [tokenList, setTokenList] = useState([]);
  const [selectedToken, setSelectedToken] = useState({});
  const [selectedColateralToken, setSelectedColateralToken] = useState({});

  const [totalToken, setTotalToken] = useState();
  const [pricePerToken, setPricePerToken] = useState();
  const [registerAsBroker, setRegisterAsBroker] = useState(false);
  const [receivingWallet, setReceivingWallet] = useState("");
  const [brokerage, setBrokerage] = useState();

  const expiryTime = 10; // link expiry time in mins

  async function getTokenList() {
    try {
      const res = await getTokens(account?.chainId);
      const list = [];
      res.data.data.tokens.map((item) => {
        list.push({ ...item, label: item?.symbol });
      });
      setTokenList(list);
    } catch (err) {
      console.log("Err", err);
    }
  }

  async function getTokenData(id, isCollateral = false) {
    try {
      const res = await getTokenDetails(id);
      console.log("ress", res);
      if (isCollateral) {
        setSelectedColateralToken(res?.data?.data);
      } else {
        setSelectedToken(res?.data?.data);
      }
    } catch (err) {
      console.log("Err", err);
    }
  }

  function handleConfirmClick() {
    const val = {
      total_token: stringToNumber(totalToken), // remove commas before converting to number
      price_per_token: stringToNumber(pricePerToken), // remove commas before converting to number
      chain_id: account?.chainId,
      trade_type: isSell ? 0 : 1,
      lot_size: selectedLotSize?.value,
      client_address: receivingWallet,
      broker_address: account?.address,
      offer_token: selectedToken?.token_address,
      receive_token: selectedColateralToken?.token_address,
      broker_fee: brokerage ? stringToNumber(brokerage) : 0,
      expire_time: Math.trunc(new Date().getTime() / 1000 + expiryTime * 60),
    };
    console.log("Vall", val);
    onConfirmClick(val);
  }

  useEffect(() => {
    getTokenList();
  }, []);

  return (
    <div>
      <Modal
        modalStyle="!w-[90vw] md:!w-[50vw] !min-w-[90vw] md:!min-w-[50vw]"
        closeModal={closeModal}
        isCloseable={!loading}
      >
        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-baseWhiteDark dark:text-baseWhite">
            {isSell ? "Create Sell Request" : "Create Buy Request"}
          </p>
          <div className="mt-4">
            <div className="flex flex-col">
              <div className="bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px]">
                <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                  Project
                </p>
                <Dropdown
                  items={tokenList}
                  selectedItem={selectedToken}
                  setSelectedItem={(selectedItem) => {
                    setSelectedToken(selectedItem);
                    getTokenData(selectedItem?._id);
                  }}
                  className={"!w-full self-end"}
                  loading={loading}
                  searchable={true}
                />
              </div>
            </div>
            <p className="mt-[10px] md:mt-4 text-base md:text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
              Investment Info
            </p>
            <div className="bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] mt-[10px] flex flex-col gap-y-4">
              <div className="flex gap-x-[10px]">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Token Amount
                  </p>
                  <input
                    type="text"
                    className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                    placeholder="Enter number of tokens"
                    value={totalToken || ""} // Use formatted value
                    onChange={(e) => {
                      const formattedValue = formatNumber(e.target.value);
                      setTotalToken(formattedValue); // Set the formatted value
                    }}
                    onWheel={(e) => {
                      e.target.blur();
                    }}
                    disabled={loading || registerAsBroker}
                    title={loading ? "Loading..." : ""}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Fill Type
                  </p>
                  <Dropdown
                    items={lotSize}
                    selectedItem={selectedLotSize}
                    setSelectedItem={(selectedItem) => {
                      setSelectedLotSize(selectedItem);
                    }}
                    className={"!w-full self-end"}
                    loading={loading}
                  />
                </div>
              </div>
              <div className="flex gap-x-[10px]">
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Price Per Token
                  </p>
                  <input
                    type="text"
                    className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-black border-gray300 dark:border-gray300Dark"
                    placeholder="Enter Amount ($)"
                    value={pricePerToken || ""} // Use formatted value
                    onChange={(e) => {
                      const formattedValue = formatNumber(e.target.value);
                      setPricePerToken(formattedValue); // Set the formatted value
                    }}
                    onWheel={(e) => e.target.blur()}
                    disabled={loading || registerAsBroker}
                    title={loading ? "Loading..." : ""}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                    Token Request
                  </p>
                  <Dropdown
                    items={tokenList}
                    selectedItem={selectedColateralToken}
                    setSelectedItem={(selectedItem) => {
                      setSelectedColateralToken(selectedItem);
                      getTokenData(selectedItem?._id, true);
                    }}
                    className={"!w-full self-end"}
                    loading={loading}
                    searchable={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border bg-gray100 dark:bg-gray100Dark border-gray200 dark:border-gray200Dark mt-[10px] rounded-[14px] p-[10px] flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Client Wallet
              </p>
              <input
                type="text"
                className="w-full font-semibold text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[13px] px-5 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                placeholder="Please enter the wallet address"
                onChange={(e) => {
                  setReceivingWallet(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Brokerage Percentage (%)
              </p>
              <input
                type="text"
                className="w-full font-semibold text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[13px] px-5 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                placeholder="Please enter brokerage percentage"
                value={brokerage || ""} // Use formatted value
                onChange={(e) => {
                  const formattedValue = formatNumber(e.target.value);
                  setBrokerage(formattedValue); // Set the formatted value
                }}
              />
            </div>
          </div>
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-[14px] flex-1 justify-center w-full mt-4"
            onClick={handleConfirmClick}
            disabled={
              loading ||
              !receivingWallet ||
              !brokerage ||
              !totalToken ||
              !pricePerToken
            }
          >
            {loading ? <Loading /> : "Confirm"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default BrokerModal;
