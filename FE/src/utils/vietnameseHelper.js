export const removeVietnameseTones = (str) => {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

export const matchesKeyword = (text, kw) => {
  if (!kw) return true;
  if (text == null) return false;
  const s = String(text).toLowerCase();
  const k = String(kw).toLowerCase().trim();
  if (!k) return true;
  if (s.includes(k)) return true;
  return removeVietnameseTones(s).includes(removeVietnameseTones(k));
};
