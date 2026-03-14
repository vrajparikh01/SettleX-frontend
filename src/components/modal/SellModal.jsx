import React, { useEffect, useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Dropdown from "../common/Dropdown";
import { getTokenDetails, getTokens } from "../../services/otc";
import { lotSize } from "../../constants/common";
import { useAccount } from "wagmi";
import Loading from "../../assets/icons/loading";
import { formatNumber, stringToNumber } from "../../utils";
import EnsInput from "../common/EnsInput";
import EnsTraderCard from "../common/EnsTraderCard";

function SellModal({ closeModal, onConfirmClick, loading = false }) {
  const account = useAccount();
  const [selectedLotSize, setSelectedLotSize] = useState(lotSize[0]);

  const [tokenList, setTokenList] = useState([]);
  const [selectedToken, setSelectedToken] = useState({});
  const [selectedColateralToken, setSelectedColateralToken] = useState({});

  const [totalToken, setTotalToken] = useState();
  const [pricePerToken, setPricePerToken] = useState();
  const [receiverAddress, setReceiverAddress] = useState(account?.address || "");
  const [ensCounterparty, setEnsCounterparty] = useState(null); // address resolved from ENS name

  async function getTokenList() {
    try {
      const res = await getTokens(account?.chainId);
      setTokenList(res?.data?.data?.tokens);
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
      trade_type: 0,
      receiver_wallet_address: receiverAddress || account?.address,
      lot_size: selectedLotSize?.value,
      receive_token: selectedColateralToken?.token_address,
      receive_token_symbol: selectedColateralToken?.symbol,
      receive_token_name: selectedColateralToken?.name,
      receive_token_decimals: selectedColateralToken?.number_of_decimals,
      receive_token_image: selectedColateralToken?.token_image,
      offer_token: selectedToken?.token_address,
      offer_token_symbol: selectedToken?.symbol,
      offer_token_name: selectedToken?.name,
      offer_token_decimals: selectedToken?.number_of_decimals,
      offer_token_image: selectedToken?.token_image,
      trader_wallet_address: account?.address,
      is_broker: false,
      broker_fee: 0,
    };
    onConfirmClick(val, selectedColateralToken, selectedToken);
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
            Create Sell Request
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
              <div className="flex items-center justify-between px-[14px] mt-[10px] md:mt-4 text-sm font-medium text-gray500 dark:text-gray500Dark bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px]">
                <p className="flex flex-col gap-y-1">
                  Token Price
                  <span className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                    ${selectedToken?.price?.toFixed(6) || "-"}
                  </span>
                </p>
                <p className="flex flex-col gap-y-1">
                  Highest Bid
                  <span className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                    NA
                  </span>
                </p>
                <p className="flex flex-col gap-y-1">
                  Last Traded
                  <span className="font-semibold text-baseWhiteDark dark:text-baseWhite">
                    NA
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-[10px] md:mt-4 text-base md:text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
              Investment Info
            </p>
            <div className="bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] mt-[10px] flex flex-col gap-y-4">
              <div className="flex flex-col">
                <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                  Receiver Address (Optional - ENS Supported)
                </p>
                <EnsInput
                  value={receiverAddress}
                  onChange={(addr) => {
                    setReceiverAddress(addr);
                    setEnsCounterparty(null);
                  }}
                  onEnsResolved={({ address }) => setEnsCounterparty(address)}
                  placeholder="vitalik.eth or 0x..."
                  disabled={loading}
                />
                <p className="text-xs text-gray500 dark:text-gray500Dark mt-1">
                  Leave empty to use your connected wallet
                </p>
                {ensCounterparty && (
                  <div className="mt-3 p-3 bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px]">
                    <p className="text-[10px] font-semibold text-gray500 dark:text-gray500Dark uppercase tracking-wider mb-2">
                      Counterparty Profile
                    </p>
                    <EnsTraderCard address={ensCounterparty} label="Counterparty" />
                  </div>
                )}
              </div>
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
                    disabled={loading}
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
                    disabled={loading}
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
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-[14px] flex-1 justify-center w-full mt-4"
            onClick={handleConfirmClick}
            disabled={loading || !totalToken || !pricePerToken}
          >
            {loading ? <Loading /> : "Confirm"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default SellModal;
