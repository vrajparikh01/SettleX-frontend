import React from "react";
import Modal from "../common/Modal";
import Loading from "../../assets/icons/loading";

function LoadingModal({ text = "" }) {
  return (
    <Modal isCloseable={false}>
      <div className="flex flex-col items-center">
        <Loading bg={"#29BD35"} width={60} height={60} />
        <div className="flex flex-col items-center">
          <p className="mt-[6px] md:mt-4 text-base font-medium text-center text-gray500 dark:text-gray500Dark">
            {text || "Please wait until the transaction is completed"}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default LoadingModal;
