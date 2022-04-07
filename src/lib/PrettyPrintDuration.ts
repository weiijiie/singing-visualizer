export function prettyPrintMilliseconds(ms: number): string {
  return prettyPrintSeconds(ms / 1000);
}

export function prettyPrintSeconds(secs: number): string {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${minutes}:${returnedSeconds}`;
}
