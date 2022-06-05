import { writable } from 'svelte/store';

export const layout = writable({
	boardName: '',
	searchBarVisible: false,
	allBoardsButtonVisible: false
});

export const resetLayout = () => {
	layout.set({
		boardName: '',
		searchBarVisible: false,
		allBoardsButtonVisible: false
	});
};
