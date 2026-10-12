export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || amount === "") return "0";
  if (typeof amount === "number") {
    return Math.round(amount).toLocaleString("vi-VN");
  }
  const str = amount.toString().trim();
  const cleaned = str
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "");
  const num = Number(cleaned);
  if (isNaN(num)) return "0";
  return num.toLocaleString("vi-VN");
};

export const formatCurrencyInput = (value) => {
  if (value === undefined || value === null) return "";
  const digitsOnly = value.toString().replace(/\D/g, "");
  if (!digitsOnly) return "";
  return Number(digitsOnly).toLocaleString("vi-VN");
};

export const parseCurrencyInput = (value) => {
  if (!value) return 0;
  const digitsOnly = value.toString().replace(/\D/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
};
