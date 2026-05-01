export type DailyRecord = {
  date: string;
  sets: number[];
};

const STORAGE_KEY = 'pullups-tracker-v1';

export function loadRecords(): DailyRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DailyRecord[];
    return parsed.filter((item) => item.date && Array.isArray(item.sets));
  } catch {
    return [];
  }
}

export function saveRecords(records: DailyRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
