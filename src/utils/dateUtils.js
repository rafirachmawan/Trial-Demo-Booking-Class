// Utility functions for date manipulation in the scheduling system

const DAYS_OF_WEEK = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
const MONTHS_FULL = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // We want Monday to be the start of the week.
  // getDay() returns 0 for Sunday, 1 for Monday, etc.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getWeekDates = (startDate) => {
  const weekDates = [];
  // We only care about Monday to Friday (5 days) -- original function, kept for legacy if used elsewhere
  for (let i = 0; i < 5; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    
    const dayName = DAYS_OF_WEEK[d.getDay()];
    const label = `${dayName}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    
    weekDates.push({
      dateString,
      dayName,
      label,
      rawDate: d
    });
  }
  return weekDates;
};

// New function: get exactly 7 days starting from a given Monday
export const getWeeklyCalendarGrid = (mondayDate) => {
  const week = [];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dateStr = String(d.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${dateStr}`;
    
    const dayName = DAYS_OF_WEEK[d.getDay()];
    const label = `${dayName}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    
    week.push({
      dateString,
      dayName,
      label,
      isWeekend,
      rawDate: new Date(d)
    });
  }
  
  // Return as an array of arrays to match the existing grid shape
  return [week];
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const startD = startDate.getDate();
  const startM = startDate.getMonth();
  const startY = startDate.getFullYear();
  
  const endD = endDate.getDate();
  const endM = endDate.getMonth();
  const endY = endDate.getFullYear();

  if (startY !== endY) {
    return `${startD} ${MONTHS_FULL[startM]} ${startY} - ${endD} ${MONTHS_FULL[endM]} ${endY}`;
  }
  if (startM !== endM) {
    return `${startD} ${MONTHS_FULL[startM]} - ${endD} ${MONTHS_FULL[endM]} ${startY}`;
  }
  return `${startD} - ${endD} ${MONTHS_FULL[startM]} ${startY}`;
};

export const getDatesInMonth = (year, month) => {
  const dates = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${date}`;
    const dayName = DAYS_OF_WEEK[d.getDay()];
    const label = `${dayName}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    
    dates.push({ dateString, dayName, label, isWeekend, rawDate: new Date(d) });
    d.setDate(d.getDate() + 1);
  }
  return dates;
};

export const getCalendarGrid = (year, month) => {
  const dates = getDatesInMonth(year, month);
  const grid = [];
  let week = [];
  if (dates.length === 0) return grid;
  
  const firstDay = dates[0].rawDate.getDay();
  const emptyDaysAtStart = firstDay === 0 ? 6 : firstDay - 1;
  
  for (let i = 0; i < emptyDaysAtStart; i++) week.push(null);
  
  dates.forEach(dateObj => {
    week.push(dateObj);
    if (week.length === 7) { grid.push(week); week = []; }
  });
  
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }
  
  return grid;
};
