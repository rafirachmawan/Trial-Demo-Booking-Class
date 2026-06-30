export const INITIAL_BRANCHES = [
  { id: 'b1', name: 'Cabang Pusat (Jakarta)', address: 'Jl. Sudirman No. 1' },
];

export const INITIAL_USERS = [
  { id: 'u1', username: 'Superadmin', role: 'superadmin', branchId: null },
  { id: 'u2', username: 'Admin Pusat', role: 'admin_cabang', branchId: 'b1' },
];

export const INITIAL_LABELS = [];
export const INITIAL_CLASSES = [];
export const INITIAL_STUDENTS = [];

import { getStartOfWeek, getWeekDates } from './dateUtils';

export const TIME_SLOTS = ["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "13:00 - 14:00"];

export const INITIAL_SLOTS = {};
