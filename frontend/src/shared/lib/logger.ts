export function logDev(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}
