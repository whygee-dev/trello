<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import Modal from '../../../components/Modal.svelte';
	import { isLight, isWhitish } from '../../../utils/color';

	export const load: Load = async ({ session, fetch, params }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		const id = params.id;

		try {
			const res = await fetch(`/board/${id}/api`);
			const board: Board & {
				workSpace: WorkSpace & {
					users: User[];
				};
				columns: (Column & {
					cards: (Card & {
						labels: Label[];
					})[];
				})[];
			} = await res.json();

			console.log('fetch');
			const tokenRes = await fetch(`/pusher/auth`);

			const token = (await tokenRes.json()).token;

			return {
				status: res.status,
				props: { board: board ?? null, token, userId: session.user.id }
			};
		} catch (error) {
			console.log(error);
		}

		return {
			status: 401,
			props: { board: [] }
		};
	};
</script>

<script lang="ts">
	import axios from 'axios';
	import type Pubnub from 'pubnub';
	import { editingCard } from './store';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { toast } from '@zerodevx/svelte-toast';
	import { handleError } from '../../../utils/errorHandler';
	import { clickOutside } from '../../../utils/clickOutside';
	import { members } from '../store';
	import { layout } from '../../../stores/layout';
	import { Pusher } from '../../../pusher';
	import type { Board, Card, Column, Label, WorkSpace, User } from '@prisma/client';

	import CardModal from '../../../components/CardModal.svelte';
	import Avatar from '../../../components/Avatar.svelte';

	export let board: Board & {
		workSpace: WorkSpace & {
			users: User[];
		};
		columns: (Column & {
			cards: (Card & {
				users: User[];
				labels: Label[];
			})[];
		})[];
	};

	export let token: string;
	export let userId: string;

	let hoveringCard = -1;
	let hoveringColumn = -1;
	let hoveringBottom = false;
	let hoveringTop = false;
	let hoveringLeft = false;
	let hoveringRight = false;
	let cardDraggable = true;
	let lastMousePost = { x: -1, y: -1 };

	let invitationDuration: Date | null;
	let invitationModalOpen = false;
	let linkModalOpen = false;
	let modalLink: string;

	let min = new Date().toISOString().slice(0, 16);
	const getMaxDate = () => {
		const d = new Date();
		d.setDate(d.getDate() + 6);
		return d.toISOString().slice(0, 16);
	};
	let max = getMaxDate();

	const copyLink = async () => {
		navigator.clipboard.writeText(modalLink);
		linkModalOpen = false;
		toast.push('Link succesfully copied !');
	};

	const createInvitation = async () => {
		try {
			const res = await axios.post('/invitation/create', {
				duration: invitationDuration,
				boardId: board.id
			});

			invitationModalOpen = false;
			linkModalOpen = true;
			invitationDuration = null;
			modalLink = res.data;
		} catch (error) {
			handleError(error);
		}
	};
	let draggedColumn = -1;
	let draggedCard = -1;
	let draggedCardColumn = -1;

	const cardDrop = async (
		event: any,
		cardTarget: number,
		columnTarget: number,
		bottom: boolean
	) => {
		event.dataTransfer.dropEffect = 'move';
		const data = JSON.parse(event.dataTransfer.getData('text/plain'));

		if (!data) return;

		if (
			typeof data.card === 'undefined' ||
			typeof data.column === 'undefined' ||
			typeof data.columnId === 'undefined' ||
			typeof data.cardId === 'undefined'
		) {
			return;
		}

		const card = data.card;
		const column = data.column;
		const newSourceColumn = board.columns[column].cards;
		const newTargetColumn = board.columns[columnTarget].cards;

		if (columnTarget === column) {
			if (card < cardTarget) {
				newSourceColumn.splice(cardTarget + 1 - Number(!bottom), 0, newSourceColumn[card]);
				newSourceColumn.splice(card, 1);
			} else {
				newSourceColumn.splice(cardTarget + Number(bottom), 0, newSourceColumn[card]);
				newSourceColumn.splice(card + 1, 1);
			}

			await axios.patch(`/card/moveCards`, {
				cards: newSourceColumn,
				sourceColumnId: data.columnId,
				targetColumnId: data.columnId,
				boardId: board.id
			});
		} else {
			newTargetColumn.splice(cardTarget + Number(bottom), 0, newSourceColumn[card]);
			newSourceColumn.splice(card, 1);

			await axios.patch(`/card/moveCards`, {
				cards: newTargetColumn,
				sourceCards: newSourceColumn,
				sourceColumnId: data.columnId,
				targetColumnId: board.columns[columnTarget].id,
				boardId: board.id
			});
		}

		board.columns[column].cards = newSourceColumn;
		board.columns[columnTarget].cards = newTargetColumn;
		board = { ...board };

		requestSync();
		reset();
	};

	const cardDragStart = (event: any, i: number, j: number, cardId: string, columnId: string) => {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		const card = i;
		const column = j;
		draggedCard = i;
		draggedCardColumn = j;

		event.dataTransfer.setData('text/plain', JSON.stringify({ card, column, cardId, columnId }));
	};

	const cardDragEnter = (e: any, i: number, j: number) => {
		clearTimeout(dragTimeout);

		dragTimeout = setTimeout(() => {
			hoveringCard = i;
			hoveringColumn = j;
			hoveringBottom = e.clientY > lastMousePost.y && i !== board.columns[j].cards.length;
			hoveringTop = e.clientY < lastMousePost.y;

			lastMousePost = { y: e.clientY, x: e.clientX };
		}, 100);
	};

	const reset = () => {
		hoveringBottom = false;
		hoveringTop = false;
		hoveringLeft = false;
		hoveringRight = false;
		hoveringCard = -1;
		hoveringColumn = -1;
		draggedColumn = -1;
		draggedCard = -1;
		draggedCardColumn = -1;
	};

	let dragTimeout: NodeJS.Timeout;

	onMount(() => {
		layout.set({
			searchBarVisible: false,
			boardName: board.title,
			allBoardsButtonVisible: false
		});
	});

	const columnDragEnter = (e: any, j: number) => {
		clearTimeout(dragTimeout);

		dragTimeout = setTimeout(() => {
			hoveringColumn = j;
			hoveringRight = e.clientX > lastMousePost.x;
			hoveringLeft = e.clientX < lastMousePost.x;

			lastMousePost = { y: e.clientY, x: e.clientX };
		}, 100);
	};

	const columnDrop = async (event: any, target: number) => {
		event.dataTransfer.dropEffect = 'move';
		const data = JSON.parse(event.dataTransfer.getData('text/plain'));

		if (!data || cardDraggable) return;

		if (typeof data.column === 'undefined') {
			return;
		}

		const column = data.column;
		const columns = board.columns;

		if (column < target) {
			columns.splice(target + 1, 0, columns[column]);
			columns.splice(column, 1);
		} else {
			columns.splice(target, 0, columns[column]);
			columns.splice(column + 1, 1);
		}

		board.columns = columns;
		board = { ...board };

		await axios.patch(`/column/moveColumns`, {
			columns,
			boardId: board.id
		});

		requestSync();
		reset();
	};

	const columnDragStart = (event: any, j: number) => {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		const column = j;
		draggedColumn = j;

		event.dataTransfer.setData('text/plain', JSON.stringify({ column }));
	};

	let createColumnModalOpen = false;
	let cardModalOpen = false;
	let selectedColumn: Column | null = null;

	let columnTitle: string | null = '';
	let editingColumn: Column | null = null;

	const createColumn = async () => {
		try {
			const res = await axios.post('/column/create', {
				boardId: board.id,
				title: columnTitle
			});

			createColumnModalOpen = false;

			requestSync();

			toast.push('Column created successfully');
		} catch (error) {
			handleError(error);
		}
	};

	const updateColumn = async (id: string | null) => {
		if (!id || !editingColumn) return;

		try {
			const res = await axios.patch(`/column/${id}/api/update`, {
				title: columnTitle
			});

			requestSync();

			toast.push('Column updated successfully');
		} catch (error) {
			handleError(error);
		}
	};

	const checkPresence = async () => {
		if (Pusher.hasLoaded()) {
			const here = await Pusher.getInstance().hereNow({
				channels: ['board-' + board.id]
			});

			$members = [
				...new Set([
					...here.channels['board-' + board.id].occupants.map((o) => o.uuid),
					...$members
				])
			];
		}
	};

	let syncThrottleTimeout: NodeJS.Timeout | null = null;
	let requestSyncTimeout: NodeJS.Timeout | null = null;

	const pubListener = {
		status: function (statusEvent) {
			if (statusEvent.category === 'PNConnectedCategory') {
				checkPresence();
			}
		},
		message: function (data) {
			if (data.message === 'REQUEST_UPDATE') {
				console.log('invalidating');
				requestSyncTimeout && clearTimeout(requestSyncTimeout);
				invalidate(`/board/${board.id}/api`);
			}
		},
		presence: function (presenceEvent) {
			if (
				(presenceEvent.action === 'timeout' || presenceEvent.action === 'leave') &&
				presenceEvent.uuid !== userId
			) {
				$members = $members.filter((m) => m !== presenceEvent.uuid);
			} else if (presenceEvent.action === 'join') {
				$members.push(presenceEvent.uuid);
				$members = [...new Set($members)];
				// @ts-ignore
			} else if (presenceEvent.action === 'interval') {
				// @ts-ignore
				if (presenceEvent.join) {
					// @ts-ignore
					$members.push(...presenceEvent.join);
					$members = [...new Set($members)];
				} else {
					checkPresence();
				}
			}
		},
		disconnect: function () {
			console.log('disconnected');
		},
		reconnect: function () {
			console.log('reconnected');
		}
	} as Pubnub.ListenerParameters;

	onMount(() => {
		Pusher.setInfos(
			'pub-c-be25a5ac-e5c9-451f-9070-e27717cc1b26',
			'sub-c-fda059c7-710d-4e8e-875d-08c257b7fb4b',
			userId,
			token,
			{ channels: ['board-' + board.id], withPresence: true },
			pubListener
		);

		Pusher.getInstance();
	});

	const requestSync = () => {
		if (syncThrottleTimeout) clearTimeout(syncThrottleTimeout);

		syncThrottleTimeout = setTimeout(() => {
			Pusher.getInstance().publish(
				{ message: 'REQUEST_UPDATE', channel: 'board-' + board.id },
				() => {
					console.log('Update request sent');
				}
			);

			requestSyncTimeout = setTimeout(() => {
				invalidate(`/board/${board.id}/api`);
			}, 2000);
		}, 500);
	};

	let focusInterval: NodeJS.Timer;

	$: {
		if (typeof window !== 'undefined') {
			clearInterval(focusInterval);
			focusInterval = setInterval(() => {
				Pusher.reconnect(
					'pub-c-be25a5ac-e5c9-451f-9070-e27717cc1b26',
					'sub-c-fda059c7-710d-4e8e-875d-08c257b7fb4b',
					userId,
					token,
					{ channels: ['board-' + board.id], withPresence: true },
					pubListener
				);
			}, 1000000);
		}
	}
</script>

<svelte:head>
	<title>Board | {board.title}</title>
</svelte:head>

<CardModal
	{selectedColumn}
	open={cardModalOpen}
	bind:card={$editingCard}
	on:close={() => {
		cardModalOpen = false;
		requestSync();
	}}
	boardMembers={board.workSpace.users}
/>

<Modal
	footerButton="+ Create"
	header="Create an invitation link"
	open={invitationModalOpen}
	on:close={() => (invitationModalOpen = false)}
	on:create={createInvitation}
>
	<div class="invitation-modal">
		<h4>Please choose a time limit for the invitation :</h4>
		<input type="datetime-local" {min} {max} bind:value={invitationDuration} placeholder="limit" />
	</div>
</Modal>

<Modal
	footerButton="+ Copy"
	header="Your invitation link"
	open={linkModalOpen}
	on:close={() => (linkModalOpen = false)}
	on:create={copyLink}
>
	<div class="invitation-modal">
		<input type="text" value={modalLink} placeholder="Link" />
	</div>
</Modal>

<Modal
	header={editingColumn ? 'Update ' + columnTitle : 'Create a new Column'}
	footerButton={editingColumn ? 'Update' : '+ Create'}
	open={createColumnModalOpen}
	on:close={() => (createColumnModalOpen = false)}
	on:create={() => (editingColumn ? updateColumn(editingColumn.id) : createColumn())}
>
	<input class="column-input" type="text" bind:value={columnTitle} placeholder="Title" />
</Modal>

<section
	class="container"
	style={`background-image: url(${
		board && board.image && board.image !== '' ? board.image : '/default-board.png'
	});`}
>
	<div class="users">
		{#each board.workSpace.users as user}
			{#if user}
				<div>
					<Avatar
						src={user.image ? user.image : ''}
						starred={user.id === board.workSpace.ownerId}
						width={32}
						round={false}
						userFullName={user.fullname}
					/>
					{#if $members.includes(user.id)}
						<span class="online-indicator green" />
					{:else}
						<span class="online-indicator red" />
					{/if}
				</div>
			{/if}
		{/each}
		{#if board.workSpace.ownerId === userId}
			<button
				class="add"
				on:click={() => {
					invitationModalOpen = true;
				}}>+</button
			>
		{/if}
	</div>

	<div class="columns scrollable">
		{#each board.columns as column, j}
			{#if !cardDraggable && hoveringColumn === j && hoveringLeft && draggedColumn !== j && draggedColumn !== j - 1}
				<div
					class="preview-drop column"
					draggable={true}
					on:dragstart={(event) => columnDragStart(event, j)}
					on:drop|preventDefault={(event) => columnDrop(event, j)}
					on:dragover={(ev) => {
						ev.preventDefault();
					}}
					on:dragenter={(e) => columnDragEnter(e, j)}
					on:dragend={reset}
				/>
			{/if}

			<div
				class="column"
				draggable={!cardDraggable}
				on:dragstart={!cardDraggable ? (event) => columnDragStart(event, j) : undefined}
				on:drop|preventDefault={!cardDraggable ? (event) => columnDrop(event, j) : undefined}
				on:dragover={(ev) => {
					if (!cardDraggable) return;
					ev.preventDefault();
				}}
				on:dragenter={!cardDraggable ? (e) => columnDragEnter(e, j) : undefined}
				on:dragend={reset}
			>
				{#if editingColumn && editingColumn.id === column.id}
					<input
						type="text"
						bind:value={columnTitle}
						on:blur={() => {
							if (columnTitle && columnTitle !== column.title) {
								updateColumn(column.id);
							}

							editingColumn = null;
						}}
						use:clickOutside
						on:click_outside={() => {
							if (columnTitle && columnTitle !== column.title) {
								updateColumn(column.id);
							}

							editingColumn = null;
						}}
					/>
				{:else}
					<h4
						on:click={() => {
							editingColumn = column;
							columnTitle = column.title;
						}}
					>
						{column.title}
					</h4>
				{/if}

				<ul>
					{#each column.cards as card, i (card.id + i)}
						{#if cardDraggable && hoveringCard === i && hoveringColumn === j && hoveringTop && (draggedCard !== i || (j && draggedCard !== i - 1)) !== draggedCardColumn}
							<li
								class="preview-drop"
								on:drop|preventDefault={(event) => cardDrop(event, i, j, hoveringBottom)}
								on:dragover={(ev) => {
									ev.preventDefault();
								}}
								on:dragenter={(e) => cardDragEnter(e, i, j)}
								on:dragend={reset}
							/>
						{/if}
						<li
							draggable={cardDraggable}
							on:dragstart={cardDraggable
								? (event) => cardDragStart(event, i, j, card.id, column.id)
								: null}
							on:drop|preventDefault={cardDraggable
								? (event) => cardDrop(event, i, j, hoveringBottom)
								: null}
							on:dragover={(ev) => {
								if (cardDraggable) return;
								ev.preventDefault();
							}}
							on:dragenter={cardDraggable ? (e) => cardDragEnter(e, i, j) : null}
							on:dragend={reset}
							on:mouseover={() => (cardDraggable = true)}
							on:focus={() => (cardDraggable = true)}
							on:mouseleave={() => (cardDraggable = draggedCard !== -1)}
							on:click={() => {
								$editingCard = {
									title: card.title,
									description: card?.description || '',
									date: card.date,
									id: card.id,
									labels: card.labels,
									users: card.users,
									cover: card.cover
								};
								selectedColumn = column;
								cardModalOpen = true;
							}}
						>
							{#if card.cover}
								<img src={card.cover} alt="Card cover" class="card-cover" />
							{/if}

							<h5>
								{card.title}
							</h5>

							<div class="labels">
								{#each card.labels as label}
									<span
										class="label"
										style="background-color: {isWhitish(label.color)
											? '#2f80ed'
											: label.color}; color: {!isLight(label.color) || isWhitish(label.color)
											? '#fff'
											: '#000'}; "
									>
										{label.title}
									</span>
								{/each}
							</div>

							<div class="card-members">
								{#each card.users as user}
									{#if user}
										<Avatar
											src={user.image ? user.image : ''}
											starred={user.id === board.workSpace.ownerId}
											width={32}
											round={false}
											userFullName={user.fullname}
										/>
									{/if}
								{/each}
							</div>
						</li>

						{#if cardDraggable && hoveringCard === i && hoveringColumn === j && hoveringBottom && (draggedCard !== i || (j && draggedCard !== i + 1) || j !== draggedCardColumn)}
							<li
								class="preview-drop"
								on:drop|preventDefault={(event) => cardDrop(event, i, j, hoveringBottom)}
								on:dragover={(ev) => {
									ev.preventDefault();
								}}
								on:dragenter={(e) => cardDragEnter(e, i, j)}
								on:dragend={reset}
							/>
						{/if}
					{/each}

					{#if hoveringCard === board.columns[j].cards.length && hoveringColumn === j && hoveringTop && (board.columns[j].cards.length - 1 !== draggedCard || j !== draggedCardColumn)}
						<li
							class="preview-drop bottom"
							on:drop|preventDefault={(event) =>
								cardDrop(event, board.columns[j].cards.length, j, hoveringBottom)}
							on:dragover={(ev) => {
								ev.preventDefault();
							}}
							on:dragenter={(e) => cardDragEnter(e, board.columns[j].cards.length, j)}
							on:dragend={reset}
						/>
					{/if}

					<li
						class="create-card"
						draggable={false}
						on:drop|preventDefault={(event) =>
							cardDrop(event, board.columns[j].cards.length, j, hoveringBottom)}
						on:dragover={(ev) => {
							ev.preventDefault();
						}}
						on:dragenter={(e) => cardDragEnter(e, board.columns[j].cards.length, j)}
						on:dragend={reset}
						on:click={() => {
							$editingCard = {
								title: '',
								description: '',
								date: new Date(),
								new: true,
								labels: [],
								users: []
							};
							(selectedColumn = column), (cardModalOpen = true);
						}}
						class:is-active={hoveringCard === board.columns[j].cards.length && hoveringColumn === j}
						class:hovering-top={hoveringCard === board.columns[j].cards.length &&
							hoveringColumn === j &&
							hoveringTop}
					>
						<h5>Add a card</h5>
						<span>+</span>
					</li>
				</ul>
			</div>

			{#if !cardDraggable && hoveringColumn === j && hoveringRight && draggedColumn !== j && draggedColumn !== j + 1}
				<div
					class="preview-drop column"
					draggable={true}
					on:dragstart={(event) => columnDragStart(event, j)}
					on:drop|preventDefault={(event) => columnDrop(event, j)}
					on:dragover={(ev) => {
						ev.preventDefault();
					}}
					on:dragenter={(e) => columnDragEnter(e, j)}
					on:dragend={reset}
				/>
			{/if}
		{/each}

		<div class="column add-column">
			<button
				class="blue-btn"
				on:click={() => {
					editingColumn = null;
					columnTitle = '';
					createColumnModalOpen = true;
				}}
			>
				+ Add a column
			</button>
		</div>
	</div>
</section>

<style lang="scss">
	.invitation-modal {
		display: flex;
		flex-direction: column;
		padding: 40px 0;

		input {
			width: 100%;
			margin-top: 10px;
		}
	}

	.container {
		[draggable='true'] {
			user-select: none !important;
			-moz-user-select: none;
			-webkit-user-select: none;
			-ms-user-select: none;
		}
		.add {
			display: flex;
			align-items: center;
			border-radius: 8px;
			background-color: #2f80ed;
			margin: 0;
			color: white;
			font-size: 22px;
			max-height: 32px;
			padding: 8px;
			transition: 0.3s all;

			&:hover {
				background-color: darken(#2f80ed, 5%);
			}
		}

		.users {
			display: flex;
			align-items: center;
			align-items: center;
			padding: 1.5rem;

			:global(img),
			button {
				margin-right: 10px !important;
			}

			> div {
				position: relative;
				.online-indicator {
					height: 12px;
					width: 12px;
					position: absolute;
					bottom: -2px;
					right: 10px;
					border-radius: 50%;
					&.green {
						background-color: green;
					}

					&.red {
						background-color: red;
					}
				}
			}
		}

		.columns {
			padding-top: 30px;
			display: flex;
			overflow-x: auto;
			height: calc(100vh - 70px - 30px - 20px - 2rem);

			.column {
				width: 250px;
				min-width: 250px;
				margin: 0 30px;
				padding: 10px;
				background-color: #ebecf0;
				border-radius: 8px;
				height: fit-content;
				cursor: move;

				&.preview-drop {
					background-color: rgba(0, 0, 0, 0.5);
					height: 300px;
				}

				&.add-column {
					background-color: transparent;
					padding: 0;
				}

				h4 {
					color: $black;
				}

				ul {
					padding: 0;
					margin: 0;

					li,
					.preview-drop {
						background-color: rgba(255, 255, 255, 0.9);
						list-style: none;
						padding: 20px 10px;
						border-radius: 8px;
						box-shadow: 0px 4px 12px 0px #0000000d;
						cursor: move;
						margin-bottom: 20px;
					}

					li {
						.card-cover {
							width: 100%;
							max-height: 200px;
							border-radius: 12px;
						}

						.card-members {
							display: flex;
							align-items: center;

							:global(.avatar-container) {
								margin: 15px 5px 10px 0;
							}
						}

						h5 {
							margin: 0;
						}
					}

					.preview-drop {
						height: 100px;
						background-color: grey;

						&.bottom {
							margin-top: -20px;
						}
					}

					.labels {
						display: flex;
						flex-wrap: wrap;

						span {
							border-radius: 5px;
							margin-right: 10px;
							margin-top: 8px;
							height: 20px;
							padding: 5px 10px;
							font-size: 15px;
							height: fit-content;
						}
					}
				}
			}
		}
		.create-card {
			display: flex;
			justify-content: space-between;
			align-items: center;
			cursor: pointer !important;
			min-height: 0 !important;
			padding: 10px !important;
		}
	}

	.column-input {
		width: 100%;
		margin: 30px 0;
	}
</style>
