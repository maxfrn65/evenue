import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Narrow a caught value to a message fit for display.
 *
 * `catch` binds `unknown`, and every handler in the app needed the same two checks;
 * they live here instead of being re-typed as `catch (error: any)` at each site.
 */
export function toErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === 'string' && error.trim() !== '') return error;
	return fallback;
}
