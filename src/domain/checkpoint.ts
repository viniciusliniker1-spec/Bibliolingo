export function checkpointPassed(correct: number, total: number, requiredAccuracy: number): boolean {
  if (total <= 0) return false;
  return correct / total >= requiredAccuracy;
}
