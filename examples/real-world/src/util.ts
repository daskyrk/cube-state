
export function sleep<R>(time: number, data?: R) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), time);
  }) as Promise<R>;
}
