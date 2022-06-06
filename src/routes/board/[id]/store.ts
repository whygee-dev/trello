import type { Label } from '@prisma/client';
import { writable } from 'svelte/store';
import type { User } from '@prisma/client';

export const editingCard = writable<
	Partial<{
		id: string;
		title: string;
		description: string;
		date: Date | null;
		labels: Label[];
		users: User[];
		cover: string | null;
	}> & { new?: boolean }
>();
