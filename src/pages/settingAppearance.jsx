import React, { useMemo, useState } from "react";

function SettingAppearance() {
  const [darkState, setDarkState] = useState(
    localStorage.getItem("color-theme")
  );
  const handleDarkMode = (isDark) => {
    if (isDark && !document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
      setDarkState("dark");
    } else if (!isDark && document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
      setDarkState("light");
    }
  };

  const isDarkMode = useMemo(() => {
    console.log("1234");
    return document.documentElement.classList.contains("dark");
  }, [darkState]);

  return (
    <div>
      <div>
        <p className="font-semibold text-base text-baseWhiteDark dark:text-baseWhite border-b border-gray300 dark:border-gray300Dark pb-[10px]">
          Appearance
        </p>
        <div className="flex flex-col pt-[10px] gap-y-[10px] pb-6">
          <div>
            <p className="font-semibold text-base text-baseWhiteDark dark:text-baseWhite">
              Theme
            </p>
            <p className="font-medium text-sm text-gray500 dark:text-gray500Dark mt-1">
              Adjust the visual appearance of SettleX Web Application as per
              your convenience.{" "}
            </p>
          </div>
          <div className="flex items-center gap-x-[10px] md:gap-x-[30px]">
            <button
              className={`p-[10px] bg-gray200 flex-1 md:flex-none w-full md:w-fit rounded-3xl ${
                !isDarkMode ? "border-[3px] border-[#5DE175]" : ""
              }`}
              onClick={() => {
                handleDarkMode(false);
              }}
            >
              <div className="w-full md:w-fit p-[10px] bg-baseWhite pb-[20px] rounded-xl">
                <div className="flex flex-col gap-y-[5px] items-center border-b border-gray300 pb-5">
                  <div className="bg-brand-gradient rounded-full h-11 w-11"></div>
                  <div className="bg-black rounded-md h-[6px] w-4/5 md:w-24"></div>
                  <div className="bg-gray400 rounded-md h-[6px] w-full md:w-32"></div>
                </div>
                <div className="flex flex-col px-[6px]">
                  <div className="bg-gray400 rounded-md h-[6px] w-3/5 md:w-20 mt-[10px]"></div>
                  <div className="bg-gray400 rounded-md h-[6px] w-full md:w-60 mt-[5px]"></div>
                </div>
              </div>
              <p className="text-center text-base font-semibold border-t border-gray300 mt-4">
                Light Theme
              </p>
            </button>
            <button
              className={`p-[10px] bg-gray200Dark flex-1 md:flex-none w-full md:w-fit rounded-3xl ${
                isDarkMode ? "border-[3px] border-[#5DE175]" : ""
              }`}
              onClick={() => {
                handleDarkMode(true);
              }}
            >
              <div className="w-full md:w-fit p-[10px] bg-black pb-[20px] rounded-xl">
                <div className="flex flex-col gap-y-[5px] items-center border-b border-gray300 pb-5">
                  <div className="bg-brand-gradient rounded-full h-11 w-11"></div>
                  <div className="bg-baseWhite rounded-md h-[6px] w-4/5 md:w-24"></div>
                  <div className="bg-gray400Dark rounded-md h-[6px] w-full md:w-32"></div>
                </div>
                <div className="flex flex-col px-[6px]">
                  <div className="bg-gray400Dark rounded-md h-[6px] w-3/5 md:w-20 mt-[10px]"></div>
                  <div className="bg-gray400Dark rounded-md h-[6px] w-full md:w-60 mt-[5px]"></div>
                </div>
              </div>
              <p className="text-center text-baseWhite text-base font-semibold border-t border-[#4D4D4D] mt-4">
                Dark Theme
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingAppearance;
