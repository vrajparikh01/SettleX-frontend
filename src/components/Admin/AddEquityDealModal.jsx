import React, { useState } from "react";
import Modal from "../common/Modal";
import Loading from "../../assets/icons/loading";
import Button from "../common/Button";
import { useAccount } from "wagmi";
import { formatNumber, stringToNumber } from "../../utils";
import { uploadImage } from "../../services/users";

function AddEquityDealModal({ closeModal, onConfirmClick, loading = false }) {
  const account = useAccount();

  const [tokenAddress, setTokenAddress] = useState({
    name: "",
    round_type: "",
    fdv: "",
    offered_amount: "",
    minimum_bid: "",
  });
  const [img, setImg] = useState({
    src: "",
    alt: "",
    uploading: false,
  });

  async function handleFileChange(e) {
    if (e.target.files[0]) {
      setImg({
        src: URL.createObjectURL(e.target.files[0]),
        alt: e.target.files[0].name,
        uploading: true,
      });
    }

    const file = e.target.files[0];
    console.log("File", file);

    const formData = new FormData();
    formData.append("file", file);

    await uploadImage(formData)
      .then((res) => {
        setTokenAddress({
          ...tokenAddress,
          logo:
            res?.data?.data,
        });
        setImg((prev) => ({
          ...prev,
          uploading: false,
        }));
      })
      .catch((err) => {
        console.log("err", err);
      });
  }

  function handleConfirmClick() {
    let addTokenData = {
      name: tokenAddress?.name,
      round_type: tokenAddress?.round_type,
      fdv: stringToNumber(tokenAddress?.fdv),
      offered_amount: stringToNumber(tokenAddress?.offered_amount),
      minimum_bid: stringToNumber(tokenAddress?.minimum_bid),
      description: "Test",
      price_per_equity: 1,
      chain_id: account?.chainId,
      logo:
        tokenAddress?.logo ||
        "https://etherscan.io/token/images/tethernew_32.png",
      wallet_address: account?.address,
    };
    console.log("Heyyy", addTokenData);
    onConfirmClick(addTokenData);
  }

  return (
    <Modal
      modalStyle="!w-[90vw] md:!w-[50vw] !min-w-[90vw] md:!min-w-[50vw] !py-14"
      closeModal={closeModal}
      isCloseable={!loading}
    >
      <div className="flex flex-col">
        <p className="text-2xl font-semibold text-baseWhiteDark dark:text-baseWhite">
          Add Equity Deal
        </p>
        <div className="mt-4 bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] flex flex-col gap-y-4">
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Project Name
              </p>
              <input
                type="text"
                className={`font-medium text-baseWhiteDark dark:text-baseWhite text-sm border rounded-full py-[10px] px-3 w-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark outline-none placeholder:font-normal ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter project name"
                onChange={(e) => {
                  setTokenAddress({ ...tokenAddress, name: e.target.value });
                }}
                onWheel={(e) => {
                  e.target.blur();
                }}
                value={tokenAddress?.name}
                disabled={loading}
                title={loading ? "Loading..." : ""}
              />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Round Type
              </p>
              <input
                type="text"
                className={`font-medium text-baseWhiteDark dark:text-baseWhite text-sm border rounded-full py-[10px] px-3 w-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark outline-none placeholder:font-normal ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter round type"
                onChange={(e) => {
                  setTokenAddress({
                    ...tokenAddress,
                    round_type: e.target.value,
                  });
                }}
                onWheel={(e) => {
                  e.target.blur();
                }}
                value={tokenAddress?.round_type}
                disabled={loading}
                title={loading ? "Loading..." : ""}
              />
            </div>
          </div>
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Lot FDV
              </p>
              <input
                type="text"
                className={`font-medium text-baseWhiteDark dark:text-baseWhite text-sm border rounded-full py-[10px] px-3 w-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark outline-none placeholder:font-normal ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter Lot FDV"
                onChange={(e) => {
                  const formattedValue = formatNumber(e.target.value);
                  setTokenAddress({ ...tokenAddress, fdv: formattedValue });
                }}
                onWheel={(e) => {
                  e.target.blur();
                }}
                value={tokenAddress?.fdv}
                disabled={loading}
                title={loading ? "Loading..." : ""}
              />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Offer Size
              </p>
              <input
                type="text"
                className={`font-medium text-baseWhiteDark dark:text-baseWhite text-sm border rounded-full py-[10px] px-3 w-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark outline-none placeholder:font-normal ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter offer size"
                onChange={(e) => {
                  const formattedValue = formatNumber(e.target.value);
                  setTokenAddress({
                    ...tokenAddress,
                    offered_amount: formattedValue,
                  });
                }}
                onWheel={(e) => {
                  e.target.blur();
                }}
                value={tokenAddress?.offered_amount}
                disabled={loading}
                title={loading ? "Loading..." : ""}
              />
            </div>
          </div>
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Minimum bid
              </p>
              <input
                type="text"
                className={`font-medium text-baseWhiteDark dark:text-baseWhite text-sm border rounded-full py-[10px] px-3 w-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark outline-none placeholder:font-normal ${
                  loading ? "cursor-not-allowed" : ""
                }`}
                placeholder="Enter minimum bid"
                onChange={(e) => {
                  const formattedValue = formatNumber(e.target.value);
                  setTokenAddress({
                    ...tokenAddress,
                    minimum_bid: formattedValue,
                  });
                }}
                onWheel={(e) => {
                  e.target.blur();
                }}
                value={tokenAddress?.minimum_bid}
                disabled={loading}
                title={loading ? "Loading..." : ""}
              />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Logo
              </p>
              {img?.uploading ? (
                <Loading />
              ) : (
                <>
                  <label
                    htmlFor="logo"
                    className={`text-sm border rounded-full py-[10px] px-3 w-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark outline-none placeholder:font-normal ${
                      loading ? "cursor-not-allowed" : ""
                    } ${
                      img?.src
                        ? "text-baseWhiteDark dark:text-baseWhite font-medium"
                        : "text-gray500 dark:text-darkGray500 font-normal"
                    }`}
                  >
                    {img?.src ? img?.alt : "Upload logo"}
                  </label>
                  <input
                    id="logo"
                    name="logo"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}
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

export default AddEquityDealModal;
