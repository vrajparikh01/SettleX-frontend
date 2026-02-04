import React from "react";
import { DownArrow, UpArrow } from "../../assets/icons";

function Tag({ arrow = "", children, className = "" }) {
  return (
    <div
      className={`${
        arrow == "up"
          ? "text-theme-green bg-theme-green/10"
          : arrow == "down"
          ? "text-theme-red bg-theme-red/10"
          : ""
      } flex items-center gap-[6px] w-fit rounded-[90px] py-1 px-[10px] text-sm font-semibold font-openmarket-general-sans ${className}`}
    >
      {arrow == "up" ? (
        <span className="h-[14px] w-[14px]">
          <UpArrow />
        </span>
      ) : arrow == "down" ? (
        <span className="h-[14px] w-[14px]">
          <DownArrow />
        </span>
      ) : (
        ""
      )}
      {children}
    </div>
  );
}

export default Tag;
