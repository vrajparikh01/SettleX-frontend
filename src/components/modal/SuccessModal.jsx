import React from "react";
import Modal from "../common/Modal";
import { SuccessIcon } from "../../assets/icons";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { getTransactionUrl } from "../../config/contract";

function SuccessModal({
  isSuccess = true,
  successText = "",
  descText = "",
  transactionHash = "",
  errorMessage = "",
  closeModal = () => {},
  handleViewOrder = () => {},
}) {
  const navigate = useNavigate(); // Get the history object to navigate
  const account = useAccount();

  const handleViewOrderClick = () => {
    if (typeof handleViewOrder === "function") {
      handleViewOrder();
      closeModal();
    } else {
      // If handleViewOrder is not provided, redirect to dashboard
      navigate("/dashboard"); // Adjust the path as necessary
      closeModal();
    }
  };
  return (
    <Modal closeModal={closeModal}>
      <div className="flex flex-col items-center">
        {isSuccess ? <SuccessIcon /> : <></>}
        <div className="flex flex-col items-center">
          <p className="text-2xl font-semibold text-center text-baseWhiteDark dark:text-baseWhite">
            {successText || ""}
          </p>
          <p className="mt-[6px] md:mt-4 text-base font-medium text-center text-gray500 dark:text-gray500Dark">
            {descText || ""}
          </p>
          {isSuccess ? (
            <p className="mt-[6px] md:mt-2 text-base font-medium text-center text-gray500 dark:text-gray500Dark">
              Check{" "}
              <span
                className="font-semibold underline cursor-pointer text-baseWhiteDark dark:text-baseWhite"
                onClick={() => {
                  if (transactionHash) {
                    window.open(
                      getTransactionUrl(account?.chainId) + transactionHash,
                      "_blank"
                    );
                  }
                }}
              >
                current orders on explorer
              </span>{" "}
              for all your open orders.
            </p>
          ) : (
            <p className="mt-[6px] md:mt-2 text-base font-medium text-center text-gray500 dark:text-gray500Dark">
              {errorMessage ? errorMessage : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col w-full mt-5 md:flex-row gap-y-4 md:mt-10 gap-x-4">
          {isSuccess ? (
            <Button
              variant="PrimaryButton"
              className="!rounded-full whitespace-nowrap py-3 flex-[5] justify-center w-full md:w-fit"
              onClick={handleViewOrderClick}
            >
              View Order
            </Button>
          ) : (
            <></>
          )}
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-3 bg-none !bg-gray200 dark:bg-gray200Dark !text-gray500 dark:text-gray500Dark flex-[3] justify-center w-full md:w-fit"
            onClick={closeModal}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SuccessModal;
