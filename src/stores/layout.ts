import { writable } from 'svelte/store';

export default writable({
	boardName: '',
	searchBarVisible: false,
	allBoardsButtonVisible: false
});
