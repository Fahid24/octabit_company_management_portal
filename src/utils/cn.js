import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

// function decryptFromASCII(asciiString) {
//   return asciiString.split('@').map(code => String.fromCharCode(parseInt(code))).join('');
// }

// console.log(decryptFromASCII())
