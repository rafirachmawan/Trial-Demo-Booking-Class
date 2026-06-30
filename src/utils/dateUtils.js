// Utility functions for date manipulation in the scheduling system

const DAYS_OF_WEEK = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

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
  // We only care about Monday to Friday (5 days)
  for (let i = 0; i < 5; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    
    // Format YYYY-MM-DD
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

export const getDatesInMonth = (year, month) => {
  const dates = [];
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${date}`;
    
    const dayName = DAYS_OF_WEEK[d.getDay()];
    const label = `${dayName}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    
    dates.push({
      dateString,
      dayName,
      label,
      isWeekend,
      rawDate: new Date(d)
    });
    
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
  
  for (let i = 0; i < emptyDaysAtStart; i++) {
    week.push(null);
  }
  
  dates.forEach(dateObj => {
    week.push(dateObj);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  });
  
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    grid.push(week);
  }
  
  return grid;
};
