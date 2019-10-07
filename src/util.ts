import { useEffect } from "react";

export function useMount(mount: any): void {
  useEffect(mount, []);
}

export const isPromise = (obj: PromiseLike<any>) => {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
};
