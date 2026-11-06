// "YYYY-MM-DD" in the visitor's local time zone (the format <input type="date"> uses).
// Not toISOString(): that converts to UTC and can return yesterday/tomorrow.
export const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
