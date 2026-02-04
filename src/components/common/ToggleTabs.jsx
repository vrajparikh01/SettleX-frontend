function Toggle({
  variant = "",
  tabs,
  activeTab,
  setActiveTab,
  className = "",
}) {
  switch (variant) {
    case "Connected":
      return (
        <div className="flex items-center p-1 border rounded-full w-fit bg-baseWhite dark:bg-black border-gray300 dark:border-gray300Dark">
          {tabs.map((tab, index) => {
            return (
              <button
                onClick={() => {
                  setActiveTab(tab);
                }}
                key={index}
                className={`flex-1 py-[6px] px-4 rounded-full w-fit text-sm font-openmarket-general-sans text-baseWhiteDark dark:text-baseWhite ${className} ${
                  activeTab.value == tab.value
                    ? "font-semibold bg-brand-gradient !text-baseWhiteDark"
                    : "font-medium"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      );
    default:
      return (
        <div className="flex items-center w-full">
          {tabs.map((tab, index) => {
            return (
              <button
                onClick={() => {
                  setActiveTab(tab);
                }}
                key={index}
                className={`flex-1 py-1 px-5 rounded-md w-fit text-sm font-openmarket-general-sans text-baseWhiteDark dark:text-baseWhite ${className} ${
                  activeTab.value == tab.value
                    ? "font-semibold bg-brand-gradient !text-baseWhiteDark"
                    : "font-medium"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      );
  }
}

export default Toggle;
// inline-block text-transparent bg-golden-gradient bg-clip-text font-vestra-poppins
