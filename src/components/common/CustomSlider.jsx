import React, { useState } from "react";

const CustomSlider = ({
  readOnly = false,
  value = 0,
  setValue = () => {},
  disabled = false,
}) => {
  const handleChange = (event) => {
    if (!readOnly) {
      setValue(event.target.value);
    }
  };

  return (
    <div className="flex items-center gap-x-4">
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className={`slider ${readOnly ? "slider-readonly" : ""} ${
            disabled ? "!cursor-not-allowed" : ""
          }`}
          disabled={readOnly || disabled}
        />
        <div className="slider-progress" style={{ width: `${value}%` }}></div>
      </div>
      {readOnly ? (
        <></>
      ) : (
        <p className="rounded-md bg-brand-gradient py-1 px-[10px] font-semibold text-xs">
          {value}%
        </p>
      )}
    </div>
  );
};

export default CustomSlider;
