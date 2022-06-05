import { writable } from 'svelte/store';

export let members = writable<string[]>([]);
