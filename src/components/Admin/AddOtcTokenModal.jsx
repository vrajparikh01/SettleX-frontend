import React, { useState } from "react";
import Modal from "../common/Modal";
import Loading from "../../assets/icons/loading";
import { config } from "../../config/contract";
import { erc20Abi } from "viem";
import { readContract } from "wagmi/actions";
import Button from "../common/Button";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/users";

function AddOtcTokenModal({
  isEdit = false,
  closeModal,
  onConfirmClick,
  loading = false,
  selectedToken = {},
}) {
  console.log("Selected Token", selectedToken);
  const account = useAccount();

  const [pricePerToken, setPricePerToken] = useState();
  const [tokenAddress, setTokenAddress] = useState({
    address:
      isEdit && selectedToken?.token_address
        ? selectedToken?.token_address
        : "",
    decimals:
      isEdit && selectedToken?.number_of_decimals
        ? selectedToken?.number_of_decimals
        : 0,
    name: isEdit && selectedToken?.name ? selectedToken?.name : "",
    symbol: isEdit && selectedToken?.symbol ? selectedToken?.symbol : "",
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

  async function getTokenData(tokenAddress) {
    try {
      const [decimals, name, symbol] = await Promise.all([
        readContract(config, {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
        }),
        readContract(config, {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "name",
        }),
        readContract(config, {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "symbol",
        }),
      ]);
      return { decimals, name, symbol };
    } catch (err) {
      console.log("errr", err, "1", Object.keys(err), "2", Object.values(err));
      return { decimals: "", name: "", symbol: "", isError: true };
    }
  }

  async function handleOfferAddress() {
    const {
      decimals,
      name,
      symbol,
      isError = false,
    } = await getTokenData(tokenAddress?.address);
    if (isError) {
      toast.info(
        "Please switch to the chain for which you are adding the token"
      );
    } else {
      setTokenAddress({
        ...tokenAddress,
        decimals: decimals || "",
        name: name || "",
        symbol: symbol || "",
      });
    }
  }

  function handleConfirmClick() {
    let addTokenData = {
      name: tokenAddress?.name,
      symbol: tokenAddress?.symbol,
      chain_id: account?.chainId,
      token_address: tokenAddress?.address,
      token_image:
        tokenAddress?.logo ||
        "https://etherscan.io/token/images/tethernew_32.png",
      description: tokenAddress?.name,
      price: pricePerToken,
      number_of_decimals: tokenAddress?.decimals,
      wallet_address: account?.address,
      token_type: 0, // 0 = normal, 1= collateral
    };
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
          {isEdit ? "Edit OTC Token" : "Add New OTC Token"}
        </p>
        <div className="mt-4 bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark rounded-[14px] p-[10px] md:p-[14px] flex flex-col gap-y-4">
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Token Address
              </p>
              <div className="w-full font-medium text-baseWhiteDark dark:text-baseWhite py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark flex items-center justify-between">
                <input
                  type="text"
                  className={`w-full bg-transparent outline-none placeholder:font-normal ${
                    loading || isEdit ? "cursor-not-allowed" : ""
                  }`}
                  placeholder="Enter address of offer token"
                  onChange={(e) => {
                    setTokenAddress({ address: e.target.value });
                  }}
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                  value={tokenAddress?.address}
                  disabled={loading || isEdit}
                  title={loading ? "Loading..." : ""}
                />
                <button
                  className={`px-2 text-sm border rounded-lg ${
                    isEdit ? "cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    handleOfferAddress();
                  }}
                  disabled={isEdit}
                >
                  Submit
                </button>
              </div>
              <div className="flex items-center justify-between px-4 text-sm">
                <p>Name: {tokenAddress?.name || "-"}</p>
                <p>Symbol: {tokenAddress?.symbol || "-"}</p>
                <p>Decimal: {tokenAddress?.decimals || "-"}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-x-[10px]">
            <div className="flex flex-col flex-1">
              <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
                Price Per Token
              </p>
              <input
                type="number"
                className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
                placeholder="Enter price of offered tokens"
                onChange={(e) => {
                  setPricePerToken(e.target.value);
                }}
                value={pricePerToken}
                onWheel={(e) => {
                  e.target.blur();
                }}
                disabled={loading}
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
          disabled={
            loading ||
            !tokenAddress?.address ||
            !tokenAddress?.decimals ||
            !tokenAddress?.name ||
            !tokenAddress?.symbol
          }
        >
          {loading ? <Loading /> : isEdit ? "Save" : "Confirm"}
        </Button>
      </div>
    </Modal>
  );
}

export default AddOtcTokenModal;
