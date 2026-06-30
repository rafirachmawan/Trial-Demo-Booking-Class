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

export const addWeeks = (date, weeks) => {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
};
