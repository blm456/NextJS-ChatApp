import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Either returns the .env value or throws an error
 */
export function pv(key: string) {
    const value = process.env[key];

    if(!value) {
        throw new Error(`Missing .env value ${key}`);
    }
    return value;
}
