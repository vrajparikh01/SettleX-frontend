import React from "react";

function Button(props) {
  const {
    variant = "",
    children,
    disabled = false,
    btnStyles = {},
    type = "button",
    onClick = () => {},
    className = "",
    // icon,
  } = props;
  switch (variant) {
    case "PrimaryButton":
      return (
        <button
          className={`${
            className || ""
          } flex items-center gap-2 py-1 px-5 rounded-md font-semibold w-fit bg-brand-gradient text-sm  font-openmarket-general-sans ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          style={btnStyles}
          type={type}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      );
    case "TransparentButton":
      return (
        <button
          className={`${
            className || ""
          } py-[6px] px-5 rounded-md w-fit bg-transparent text-sm font-semibold font-openmarket-general-sans border border-theme-green text-baseWhiteDark dark:text-baseWhite whitespace-nowrap ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          style={btnStyles}
          type={type}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
      );
    default:
      return <button>{children}</button>;
  }
}

export default Button;
