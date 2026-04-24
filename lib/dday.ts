export function calcDday(dateStr: string, todayS: string): string {
  if (!dateStr) return '';

  const diff = Math.round(
    (new Date(dateStr).getTime() - new Date(todayS).getTime()) / 86400000
  );

  if (diff === 0) return 'D-DAY';
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}
