import type { Label } from '@prisma/client';
import { writable } from 'svelte/store';

export const editingCard = writable<
	Partial<{
		id: string;
		title: string;
		description: string;
		date: Date | null;
		labels: Label[];
		users: User[];
	}> & { new?: boolean }
>();
