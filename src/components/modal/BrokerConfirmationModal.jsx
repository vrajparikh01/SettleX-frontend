import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

function BrokerConfirmationModal({
  setRegisterAsBroker = () => {},
  setIsBrokerModalOpen = () => {},
}) {
  const [isBroker, setIsBroker] = useState(false);

  return (
    <Modal
      closeModal={() => {
        setIsBrokerModalOpen(false);
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-x-4">
          <p className="text-2xl font-semibold text-baseWhiteDark dark:text-baseWhite">
            Register as broker ?
          </p>
        </div>
        <div className="flex items-center mt-4 gap-x-4">
          <input
            type="checkbox"
            id="isBroker"
            name="isBroker"
            value="Bike"
            className="cursor-pointer"
            onChange={() => {
              setIsBroker(!isBroker);
            }}
          />
          <label for="isBroker" className="cursor-pointer">
            Want to list this as a broker
          </label>
        </div>
        <div className="flex flex-col w-full mt-6 md:flex-row gap-y-4 gap-x-4">
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-3 justify-center w-fit flex-1"
            disabled={!isBroker}
            onClick={() => {
              setRegisterAsBroker(true);
              setIsBrokerModalOpen(false);
            }}
          >
            Yes
          </Button>
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-3 bg-none !bg-gray200 dark:bg-gray200Dark !text-gray500 dark:text-gray500Dark justify-center w-fit flex-1"
            onClick={() => {
              setIsBrokerModalOpen(false);
            }}
          >
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BrokerConfirmationModal;
