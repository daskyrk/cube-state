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

/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
// export default function isPlainObject(obj: any): boolean {
//   if (typeof obj !== 'object' || obj === null) return false;

//   let proto = obj;
//   while (Object.getPrototypeOf(proto) !== null) {
//     proto = Object.getPrototypeOf(proto);
//   }

//   return Object.getPrototypeOf(obj) === proto;
// }
