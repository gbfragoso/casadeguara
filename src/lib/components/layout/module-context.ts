import { createContext } from 'svelte';

export const [getModuleName, setModuleName, hasModuleName] = createContext<() => string>();

export function readModuleName() {
	return hasModuleName() ? getModuleName() : undefined;
}
