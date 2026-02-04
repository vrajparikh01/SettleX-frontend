import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

function CancelConfirmationModal({
  titleText = "",
  closeModal = () => {},
  confirmFunction = () => {},
}) {
  const handleDeleteConfirmation = () => {
    confirmFunction();
  };
  return (
    <Modal closeModal={closeModal}>
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold text-left text-baseWhiteDark dark:text-baseWhite">
          {titleText || "Are you sure you want to delete the offer ?"}
        </p>
        <div className="flex flex-col w-full mt-2 md:flex-row gap-y-4 md:mt-6 gap-x-4">
          <Button
            variant="PrimaryButton"
            className="!rounded-full whitespace-nowrap py-3 flex-[5] justify-center w-full md:w-fit"
            onClick={handleDeleteConfirmation}
          >
            Delete
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

export default CancelConfirmationModal;
