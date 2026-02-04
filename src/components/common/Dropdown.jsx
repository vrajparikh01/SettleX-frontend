import React, { useEffect, useRef, useState } from "react";
import { DownArrow, DropdownArrow } from "../../assets/icons";

function Dropdown({
  items,
  selectedItem,
  searchable = false,
  setSelectedItem,
  dropdownStyles = {},
  className = "",
  containerClassName = "",
  iconClassName = "",
  inputStyle = "",
  loading = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(items);

  const modalRef = useRef(null);
  const inputRef = useRef(null); // Added ref to the input field

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  useEffect(() => {
    // Update filtered items whenever the search term changes
    setFilteredOptions(
      items.filter(
        (option) =>
          option?.label?.toLowerCase()?.includes(searchTerm.toLowerCase()) ??
          option?.symbol?.toLowerCase()?.includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, items]);

  useEffect(() => {
    // Focus the input when the dropdown opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={`relative dropdown_wrapper ${className}`} ref={modalRef}>
      <div
        className={`flex items-center justify-between px-3 rounded-[90px] text-sm font-semibold leading-5 cursor-pointer gap-x-[10px] py-[10px] transition-all border border-gray300 dark:border-gray300Dark bg-baseWhite dark:bg-black selected_option ${containerClassName} ${
          loading || disabled ? "!cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (!loading && !disabled) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {isOpen && searchable ? (
          // Show search input in place of the selected item when the dropdown is open
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            className={`w-full px-2 text-sm focus:outline-none bg-baseWhite dark:bg-black text-baseWhiteDark dark:text-baseWhite ${inputStyle}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        ) : selectedItem && Object.keys(selectedItem).length > 0 ? (
          <div className="flex items-center gap-1">
            {selectedItem?.logo ? (
              <span className={`w-6 h-6 ${iconClassName}`}>
                {selectedItem?.logo}
              </span>
            ) : selectedItem?.token_image ? (
              <img
                src={selectedItem?.token_image}
                alt={selectedItem?.label || selectedItem?.symbol}
                className={`w-6 h-6 ${iconClassName}`}
              />
            ) : (
              <></>
            )}
            <p
              className={`whitespace-nowrap transition-all text-baseWhiteDark dark:text-baseWhite`}
            >
              {selectedItem?.label || selectedItem?.symbol}
            </p>
          </div>
        ) : (
          <p
            className={`whitespace-nowrap transition-all font-normal text-gray500 dark:text-darkGray500`}
          >
            Select token
          </p>
        )}
        <span
          className={`block w-4 h-4 transition-all ${
            isOpen ? "-rotate-180" : "rotate-0"
          }`}
        >
          <DropdownArrow />
        </span>
      </div>
      {isOpen && (
        <div
          className={`absolute right-0 z-50 w-full mt-1 bg-gray100 dark:bg-gray100Dark rounded-lg shadow-dropdown-box min-w-fit top-full dropdown_options ${dropdownStyles}`}
        >
          <div className="overflow-y-auto flex flex-col border border-gray-300 rounded-lg gap-y-2 options_wrapper bg-baseWhite dark:bg-black text-baseWhiteDark dark:text-baseWhite max-h-[20vh] w-max">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => (
                <div
                  key={item.value ?? index}
                  className="flex items-center px-3 cursor-pointer gap-x-2 first:pt-2 last:pb-2"
                  onClick={() => {
                    setSelectedItem(item);
                    setIsOpen(false);
                    setSearchTerm(""); // Clear search term after selection
                  }}
                >
                  {item?.logo ? (
                    <span className={`w-6 h-6 ${iconClassName}`}>
                      {item?.logo}
                    </span>
                  ) : item?.token_image ? (
                    <img
                      src={item?.token_image}
                      alt={item?.label || item?.symbol}
                      className={`w-6 h-6 ${iconClassName}`}
                    />
                  ) : (
                    <></>
                  )}
                  <p
                    className={`text-sm hover:text-baseWhiteDark dark:text-baseWhite whitespace-nowrap ${
                      selectedItem?.value == item.value
                        ? "font-bold text-baseWhiteDark dark:text-baseWhite"
                        : "font-medium text-link-color"
                    }`}
                  >
                    {item?.label || item?.symbol}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
