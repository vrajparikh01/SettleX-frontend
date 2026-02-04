import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import {
  BrokerIcon,
  BrokersDarkIcon,
  OTCDarkIcon,
  OTCLogo,
  PreMarket,
  PremarketDarkIcon,
} from "../../assets/icons";

function OptionModal({ handleNextBtnClick, closeModal }) {
  const [selectedOption, setSelectedOption] = useState("");
  function handleNextClick() {
    handleNextBtnClick(selectedOption);
  }
  return (
    <Modal
      modalStyle="!w-[90vw] md:!w-[50vw] !min-w-[90vw] md:!min-w-[50vw]"
      closeModal={closeModal}
    >
      <div className="flex flex-col">
        <p className="text-2xl font-semibold text-baseWhiteDark dark:text-baseWhite">
          Please Select
        </p>
        <div className="flex flex-row mt-4 gap-x-2">
          <button
            className={`flex-1 flex flex-col items-center justify-center py-5 border ${
              selectedOption == "premarket"
                ? "border-theme-warning"
                : "border-gray300"
            } rounded-lg`}
            onClick={() => {
              if (selectedOption == "premarket") {
                setSelectedOption("");
              } else {
                setSelectedOption("premarket");
              }
            }}
          >
            <span className="block dark:hidden">
              <PreMarket isActive={selectedOption == "premarket"} />
            </span>
            <span className="hidden dark:block">
              <PremarketDarkIcon isActive={selectedOption == "premarket"} />
            </span>
            <p
              className={`text-sm ${
                selectedOption == "premarket"
                  ? "text-baseWhiteDark dark:test-baseWhite font-semibold"
                  : "text-gray500 dark:text-gray500Dark font-medium"
              }`}
            >
              Pre-market
            </p>
          </button>
          <button
            className={`flex-1 flex flex-col items-center justify-center py-5 border ${
              selectedOption == "otc"
                ? "border-theme-warning"
                : "border-gray300"
            } rounded-lg`}
            onClick={() => {
              if (selectedOption == "otc") {
                setSelectedOption("");
              } else {
                setSelectedOption("otc");
              }
            }}
          >
            <span className="block dark:hidden">
              <OTCLogo isActive={selectedOption == "otc"} />
            </span>
            <span className="hidden dark:block">
              <OTCDarkIcon isActive={selectedOption == "otc"} />
            </span>
            <p
              className={`text-sm ${
                selectedOption == "otc"
                  ? "text-baseWhiteDark dark:test-baseWhite font-semibold"
                  : "text-gray500 dark:text-gray500Dark font-medium"
              }`}
            >
              OTC
            </p>
          </button>
          <button
            className={`flex-1 flex flex-col items-center justify-center py-5 border ${
              selectedOption == "otcBroker"
                ? "border-theme-warning"
                : "border-gray300"
            } rounded-lg`}
            onClick={() => {
              if (selectedOption == "otcBroker") {
                setSelectedOption("");
              } else {
                setSelectedOption("otcBroker");
              }
            }}
          >
            <span className="block dark:hidden">
              <BrokerIcon isActive={selectedOption == "otcBroker"} />
            </span>
            <span className="hidden dark:block">
              <BrokersDarkIcon isActive={selectedOption == "otcBroker"} />
            </span>
            <p
              className={`text-sm ${
                selectedOption == "otcBroker"
                  ? "text-baseWhiteDark dark:test-baseWhite font-semibold"
                  : "text-gray500 dark:text-gray500Dark font-medium"
              }`}
            >
              OTC Broker
            </p>
          </button>
        </div>
        <Button
          variant="PrimaryButton"
          className="!rounded-full whitespace-nowrap py-[14px] flex-1 justify-center w-full mt-4"
          onClick={handleNextClick}
        >
          Next
        </Button>
      </div>
    </Modal>
  );
}

export default OptionModal;
