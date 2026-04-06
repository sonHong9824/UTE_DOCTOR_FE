// Date helpers for appointment feature.
export const getTodayLocalDate = () => new Date().toLocaleDateString("en-CA");

export const toUtcIsoDate = (localDateStr: string) => {
  const [year, month, day] = localDateStr.split("-").map(Number);
  if (!year || !month || !day) return localDateStr;

  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  return localDate.toISOString();
};
