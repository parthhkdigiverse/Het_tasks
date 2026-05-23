const { format, addDays } = require("date-fns");

function getNextOccurrence(dateStr, days) {
  if (!days || days.length === 0) return dateStr;
  
  let date = new Date(dateStr);
  if (!dateStr.includes('T')) {
    const parts = dateStr.split('-');
    date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  
  for (let i = 0; i < 7; i++) {
    const d = addDays(date, i);
    if (days.includes(format(d, 'EEE'))) {
      return format(d, 'yyyy-MM-dd');
    }
  }
  return dateStr;
}

console.log(getNextOccurrence("2026-05-23", ["Wed"]));
