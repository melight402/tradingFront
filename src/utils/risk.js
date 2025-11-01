export const validateRiskInput = (value) => {
  let cleaned = value.replace(/[^\d.]/g, "");

  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("");
  }

  if (cleaned.startsWith(".")) {
    cleaned = "0" + cleaned;
  }

  if (cleaned === ".") {
    cleaned = "0.";
  }

  const [integerPart, decimalPart = ""] = cleaned.split(".");

  let validInteger = integerPart;
  if (integerPart.length > 4 || parseInt(integerPart) > 9999) {
    validInteger = "9999";
  }

  const validDecimal = decimalPart.slice(0, 2);

  let result = validInteger;
  if (validDecimal || cleaned.includes(".")) {
    result += "." + validDecimal;
  }

  const numValue = parseFloat(result);
  if (numValue > 9999.99) {
    result = "9999.99";
  }

  return result;
};

export const formatRiskValue = (value) => {
  if (value === undefined || value === null || isNaN(value)) {
    return "1.00";
  }
  const numValue = parseFloat(value);
  return numValue.toFixed(2);
};
