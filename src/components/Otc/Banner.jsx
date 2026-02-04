import React from "react";
import { ActiveIcon, EyeGrayIcon, UpArrow } from "../../assets/icons";

function Banner({
  className = "",
  icon = <ActiveIcon />,
  title = "Top Most Active",
  list = [],
}) {
  return (
    <div
      className={`bg-gray100 dark:bg-gray100Dark rounded-[20px] p-[14px] border border-gray-200 ${className}`}
    >
      <div className="flex items-center pb-4 gap-x-[6px] md:gap-x-2">
        <span className="block w-4 h-4">{icon}</span>
        <p className="text-sm font-semibold text-gray500 dark:text-gray500Dark">
          {title}
        </p>
      </div>
      <div className="flex flex-col gap-y-[6px]">
        {list && list?.length ? (
          list.map((item, index) => {
            return (
              <div className="flex items-center justify-between" key={index}>
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                    {index + 1}
                  </p>
                  <img
                    src={item?.token_image}
                    alt="Logo"
                    className="w-8 h-8 ml-2 md:ml-4"
                  />
                  <p className="ml-2 text-base font-medium text-baseWhiteDark dark:text-baseWhite">
                    {item?.name}
                  </p>
                </div>
                <div className="flex items-center gap-x-[6px]">
                  <EyeGrayIcon />
                  <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
                    {item?.view_counts || 0}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-3 text-base font-medium bg-gray100 dark:bg-gray100Dark rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4">
            <p className="w-full text-center">No Data</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Banner;
