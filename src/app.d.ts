// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Correlation id for the current request, echoed in the x-request-id header. */
			requestId?: string;
			user?: {
				id: string;
				email: string;
				firstName: string;
				lastName: string;
				role: string;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
