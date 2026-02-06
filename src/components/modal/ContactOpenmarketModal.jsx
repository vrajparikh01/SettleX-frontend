import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

function ContactOpenMarketModal({ closeModal = () => {} }) {
  const handleViewOrderClick = () => {
    window.open("https://telegram.org/", "_blank");
  };
  return (
    <Modal closeModal={closeModal}>
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center">
          <p className="text-2xl font-semibold text-center text-baseWhiteDark dark:text-baseWhite">
            Contact SettleX{" "}
          </p>
          <p className="mt-[6px] md:mt-2 text-base font-medium text-center text-gray500 dark:text-gray500Dark">
            Please contact to SettleX admin to invest in this equity deal.
          </p>
        </div>
        <div className="flex flex-col w-full mt-5 md:flex-row gap-y-4 md:mt-10 gap-x-4">
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-3 flex-[5] justify-center w-full md:w-fit"
            onClick={handleViewOrderClick}
          >
            Contact SettleX
          </Button>
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-3 bg-none !bg-gray200 dark:bg-gray200Dark !text-gray500 dark:text-gray500Dark flex-[3] justify-center w-full md:w-fit"
            onClick={closeModal}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ContactOpenMarketModal;
