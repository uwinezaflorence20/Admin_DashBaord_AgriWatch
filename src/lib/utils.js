import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString, lang = 'en') {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
    
    const monthNamesEn = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const monthNamesRw = [
      "Mutarama", "Gashyantare", "Werurwe", "Mata", "Gicurasi", "Kamena",
      "Nyakanga", "Kanama", "Nzeri", "Ukwakira", "Ugushyingo", "Ukuboza"
    ];
    
    const month = lang === 'rw' ? monthNamesRw[date.getMonth()] : monthNamesEn[date.getMonth()];
    
    return `${day} ${month} ${year}`;
  } catch {
    return dateString.split('T')[0];
  }
}

export const getText = (val, lang = 'en') => {
  if (!val) return '';
  let parsed = val;
  if (typeof val === 'string') {
    try {
      parsed = JSON.parse(val);
    } catch {
      return val;
    }
  }
  if (typeof parsed === 'string') return parsed;
  return parsed[lang] || parsed.en || '';
};
