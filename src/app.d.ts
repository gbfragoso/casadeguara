import type { DndEvent } from 'svelte-dnd-action';

// Each handler declares its own item type; `never` items accept any of them.
type DndZoneEvent<Target> = CustomEvent<DndEvent<never>> & { currentTarget: EventTarget & Target };

declare module 'svelte/elements' {
	interface HTMLAttributes<T extends EventTarget> {
		onconsider?(event: DndZoneEvent<T>): void;
		onfinalize?(event: DndZoneEvent<T>): void;
	}
}

declare global {
	namespace App {
		interface Locals {
			user: import('#lib/server/auth/session.js').SessionUser | null;
			session: import('#lib/server/auth/session.js').Session | null;
		}
	}
}

export {};
