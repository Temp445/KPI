export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function clampEndMonthYear(
  startMonth: string,
  startYear: number,
  endMonth: string,
  endYear: number
): { newEndMonth: string; newEndYear: number; exceeded: boolean } {
  const startIndex = startYear * 12 + months.indexOf(startMonth);
  const endIndex = endYear * 12 + months.indexOf(endMonth);

  const maxEndIndex = startIndex + 11;
  const exceeded = endIndex > maxEndIndex;

  const clampedIndex = Math.min(endIndex, maxEndIndex);

  const newEndYear = Math.floor(clampedIndex / 12);
  const newEndMonth = months[clampedIndex % 12];

  return { newEndMonth, newEndYear, exceeded };
}
