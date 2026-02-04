import { useEffect, useRef } from "react";
import { CrossIcon } from "../../assets/icons";

function Modal({
  children,
  closeModal = () => {},
  modalStyle = "",
  isCloseable = true,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    let handleClickOutside;
    let handleEscKey;
    if (isCloseable) {
      handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          closeModal();
        }
      };

      handleEscKey = (event) => {
        if (event.key === "Escape") {
          closeModal();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleEscKey);
    }

    return () => {
      if (isCloseable) {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("keydown", handleEscKey);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCloseable]);

  return (
    <div>
      <div className="h-screen w-screen bg-black/50 fixed z-[150] top-0 left-0 backdrop-blur-[10px]">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 h-fit w-full md:w-[30vw] min-w-[35vw] max-w-[80vw] max-h-[80vh] bg-baseWhite dark:bg-black backdrop-blur-[20px] rounded-3xl border border-[#23CBCA80] px-[10px] py-[10px] md:px-10 md:py-10 overflow-y-auto ${modalStyle}`}
          ref={modalRef}
        >
          {isCloseable ? (
            <span
              className="absolute flex cursor-pointer w-fit right-[20px] top-[10px] md:right-10 md:top-10"
              onClick={closeModal}
            >
              <CrossIcon />
            </span>
          ) : (
            <></>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
