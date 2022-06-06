import { writable } from 'svelte/store';

export const members = writable<string[]>([]);
