import { format, parseISO, isToday } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const isDateToday = (dateString) => {
  if (!dateString) return false;
  return isToday(parseISO(dateString));
};

export const formatDateForBackend = (date) => {
  return format(date, 'yyyy-MM-dd');
};
