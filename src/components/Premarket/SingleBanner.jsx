import React from "react";
import BannerBg1 from "../../assets/images/BannerBg1.png";
import BannerBg2 from "../../assets/images/BannerBg2.png";
import BannerBg3 from "../../assets/images/BannerBg3.png";
import BannerBg4 from "../../assets/images/BannerBg4.png";
import { EyeGrayIcon } from "../../assets/icons";

function SingleBanner({
  className = "",
  index = 0,
  icon = "",
  title = "",
  view = 0,
  iconTheme = "",
}) {
  return (
    <div
      className={`${className} min-w-72 relative h-44 rounded-3xl overflow-hidden`}
      style={{ backgroundColor: iconTheme }}
    >
      <img
        src={
          index == 0
            ? BannerBg1
            : index == 1
            ? BannerBg2
            : index == 2
            ? BannerBg3
            : index == 3
            ? BannerBg4
            : BannerBg1
        }
        alt="bannerbg"
        className="w-full h-full mix-blend-plus-lighter"
      />
      <div className="h-[90px] w-[90px] rounded-full bg-baseWhite dark:bg-black flex items-center justify-center absolute top-6 left-1/2 -translate-x-1/2">
        <img src={icon} alt="logo" className="h-[76px] w-[76px] rounded-full" />
      </div>
      <div className="flex items-center justify-center rounded-md bg-baseWhite dark:bg-black px-[14px] py-[6px] absolute bottom-[10px] w-[calc(100%-20px)] left-1/2 -translate-x-1/2">
        <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
          {title}
        </p>
        {/* <div className="flex items-center gap-x-2">
          <span>
            <EyeGrayIcon />
          </span>
          <p className="text-sm font-medium text-gray500 dark:text-gray500Dark">
            {view}
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default SingleBanner;
