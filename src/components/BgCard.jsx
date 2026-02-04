import React from "react";
import Button from "./common/Button";

function BgCard({
  icon = "",
  title = "",
  desc = "",
  button = "",
  className = "",
  descClassname = "",
}) {
  return (
    <div className={`font-openmarket-general-sans w-fit ${className}`}>
      <div className="flex items-center gap-x-4">
        {icon ? (
          <div className="p-3 bg-baseWhite dark:bg-black rounded-full w-fit">
            {icon}
          </div>
        ) : (
          <></>
        )}
        <div>
          {title ? (
            <p className="text-xl font-semibold text-baseWhiteDark dark:text-baseWhite">
              {title}
            </p>
          ) : (
            <></>
          )}
          {desc ? (
            <p
              className={`font-medium text-[15px] leading-5 text-gray500 dark:text-gray500Dark ${descClassname}`}
            >
              {desc}
            </p>
          ) : (
            <></>
          )}
        </div>
      </div>
      {button ? (
        <Button
          variant="PrimaryButton"
          className="!rounded-[90px] w-full justify-center py-[10px] mt-16"
        >
          {button}
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
}

export default BgCard;
