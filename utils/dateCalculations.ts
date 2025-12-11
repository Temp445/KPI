export function getDaysInMonth(month: string, year: number): number {
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getWeeksInYear(year: number): number {
  const lastDayOfYear = new Date(year, 11, 31);
  const firstDayOfYear = new Date(year, 0, 1);

  const dayOfWeek = lastDayOfYear.getDay();
  const weekNumber = Math.round(
    ((lastDayOfYear.getTime() - firstDayOfYear.getTime()) / 86400000 + firstDayOfYear.getDay() + 1) / 7
  );

  return weekNumber === 53 ? 53 : 52;
}


/** Returns YYYY-MM-DD for the first day of the given monthName/year */
export function getMonthStartISO(monthName: string, year: number): string {
  const monthIndex = getMonthIndex(monthName);
  return new Date(year, monthIndex, 1).toISOString().split("T")[0];
}

/** Returns YYYY-MM-DD for the last day of the given monthName/year */
export function getMonthEndISO(monthName: string, year: number): string {
  const monthIndex = getMonthIndex(monthName);
  return new Date(year, monthIndex + 1, 0).toISOString().split("T")[0];
}


export function getWeeksBetweenMonths(
  startMonth: string,
  startYear: number,
  endMonth: string,
  endYear: number
): number {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const startIndex = months.indexOf(startMonth);
  const endIndex = months.indexOf(endMonth);

  if (startIndex === -1 || endIndex === -1) return 0;

  // Invalid range check
  if (endYear < startYear) return 0;
  if (endYear === startYear && endIndex < startIndex) return 0;

  const startDate = new Date(startYear, startIndex, 1);

  const endDate = new Date(endYear, endIndex + 1, 0);

  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

  const startDayOfWeek = startDate.getDay(); 

  return Math.ceil((totalDays + startDayOfWeek) / 7);
}



export function getSelectedMonthLength(
  startMonth: string,
  startYear: number,
  endMonth: string,
  endYear: number
): number {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const startIndex = months.indexOf(startMonth);
  const endIndex = months.indexOf(endMonth);

  if (startIndex === -1 || endIndex === -1) return 0;

  if (endYear < startYear) return 0;
  if (endYear === startYear && endIndex < startIndex) return 0;

  if (startYear === endYear) {
    return endIndex - startIndex + 1;
  }

  const monthsInStartYear = 12 - startIndex;

  const monthsInEndYear = endIndex + 1;

  const fullYearsBetween = endYear - startYear - 1;
  const monthsInBetween = fullYearsBetween > 0 ? fullYearsBetween * 12 : 0;

  return monthsInStartYear + monthsInBetween + monthsInEndYear;
}




export function getMonthIndex(monthName: string): number {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.indexOf(monthName);
}
