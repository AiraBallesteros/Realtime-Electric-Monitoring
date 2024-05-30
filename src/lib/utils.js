import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function currency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export function legend(voltage) {
  let color = "bg-green-500 text-green-100";
  if (voltage >= 253) color = "bg-red-500 text-red-100";
  else if (voltage == 0) color = "bg-gray-500 text-gray-100";
  else if (voltage <= 207) color = "bg-orange-500 text-orange-100";
  return color;
}
