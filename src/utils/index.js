const applyDebounce = (fn, delay) => {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// Helper function to format numbers with commas
function formatNumber(value) {
  const numericValue = value.replace(/[^\d.]/g, "");
  const [integerPart, decimalPart] = numericValue.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return value.includes(".")
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

function formatStringToNumber(value) {
  const newVal = String(value);
  const numericValue = newVal.replace(/[^\d.]/g, "");
  const [integerPart, decimalPart] = numericValue.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (newVal.includes(".")) {
    const roundedDecimal = decimalPart
      ? parseFloat(`0.${decimalPart}`).toString().slice(2)
      : "";
    return `${formattedInteger}.${roundedDecimal}`;
  }
  return formattedInteger;
}

function stringToNumber(value) {
  const numericValue = String(value).replace(/[^0-9.-]+/g, ""); // Remove non-numeric characters
  return Number(numericValue);
}

export { applyDebounce, formatNumber, formatStringToNumber, stringToNumber };
