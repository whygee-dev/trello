<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import Modal from '../../../components/Modal.svelte';

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

			// for (let i = 0; i < 3; i++) {
			// 	board.columns[0].cards.push(
			// 		...board.columns[0].cards.map((c: any) => {
			// 			return { ...c, id: String(Math.floor(Math.random() * 100)) };
			// 		})
			// 	);
			// }

			// for (let i = 0; i < 3; i++) {
			// 	board.columns.push(
			// 		...board.columns.map((c) => {
			// 			return { ...c, cards: [...c.cards] };
			// 		})
			// 	);
			// }

			return {
				status: res.status,
				props: { board: board ?? null }
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
	import type { Board, Card, Column, Label, WorkSpace } from '@prisma/client';
	import Avatar from '../../../components/Avatar.svelte';
	import { afterNavigate } from '$app/navigation';
	import layout from '../../../stores/layout';
	import { handleError } from '../../../utils/errorHandler';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { toast } from '@zerodevx/svelte-toast';

	export let board: Board & {
		workSpace: WorkSpace & {
			users: User[];
		};
		columns: (Column & {
			cards: (Card & {
				labels: Label[];
			})[];
		})[];
	};

	let hoveringCard = -1;
	let hoveringColumn = -1;
	let hoveringBottom = false;
	let hoveringTop = false;
	let hoveringLeft = false;
	let hoveringRight = false;
	let cardDraggable = true;
	let lastMousePost = { x: -1, y: -1 };
	let userToAdd: string;
	let invitationModalOpen = false;
	let linkModalOpen = false;
	let modalLink: string;

	const copyLink = async () => {
		navigator.clipboard.writeText(modalLink);
		linkModalOpen = false;
		toast.push('Link succesfully copied !');
	};

	const createInvitation = async () => {
		try {
			const res = await axios.post('/invitation/create', {
				email: userToAdd,
				boardId: board.id
			});

			invitationModalOpen = false;
			linkModalOpen = true;
			userToAdd = '';
			modalLink = res.data;
		} catch (error) {
			handleError(error);
		}
	};
	let draggedColumn = -1;
	let draggedCard = -1;
	let draggedCardColumn = -1;

	const cardDrop = (event: any, cardTarget: number, columnTarget: number, bottom: boolean) => {
		event.dataTransfer.dropEffect = 'move';
		const data = JSON.parse(event.dataTransfer.getData('text/plain'));

		if (!data) return;

		if (typeof data.card === 'undefined' || typeof data.column === 'undefined') {
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
		} else {
			newTargetColumn.splice(cardTarget + Number(bottom), 0, newSourceColumn[card]);
			newSourceColumn.splice(card, 1);
		}

		board.columns[column].cards = newSourceColumn;
		board.columns[columnTarget].cards = newTargetColumn;
		board = { ...board };

		reset();
	};

	const cardDragStart = (event: any, i: number, j: number) => {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		const card = i;
		const column = j;
		draggedCard = i;
		draggedCardColumn = j;

		event.dataTransfer.setData('text/plain', JSON.stringify({ card, column }));
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

	afterNavigate(() => {
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

	const columnDrop = (event: any, target: number) => {
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

		reset();
	};

	const columnDragStart = (event: any, j: number) => {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		const column = j;
		draggedColumn = j;

		event.dataTransfer.setData('text/plain', JSON.stringify({ column }));
	};
</script>

<svelte:head>
	<title>Board | {board.title}</title>
</svelte:head>

<Modal
	footerButton="+ Create"
	header="Create an invitation link"
	open={invitationModalOpen}
	on:close={() => (invitationModalOpen = false)}
	on:create={createInvitation}
>
	<div class="invitation-modal">
		<input type="email" bind:value={userToAdd} placeholder="Email" />
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

<section class="container" style={`background-image: url(${board.image ?? '/default-board.jpg'});`}>
	<div class="users">
		{#each board.workSpace.users as user}
			{#if user}
				<Avatar
					starred={user.id === board.workSpace.ownerId}
					width={32}
					round={false}
					userFullName={user.fullname}
				/>
			{/if}
		{/each}
		<button
			class="add"
			on:click={() => {
				invitationModalOpen = true;
			}}>+</button
		>
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
				<h4>{column.title}</h4>
				<ul>
					{#each column.cards as card, i (card.id + i)}
						{#if cardDraggable && hoveringCard === i && hoveringColumn === j && hoveringTop && (draggedCard !== i || j !== draggedCardColumn)}
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
							on:dragstart={cardDraggable ? (event) => cardDragStart(event, i, j) : null}
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
						>
							<h5>
								{card.title}
								{card.id}
							</h5>

							{#each card.labels as label}
								<span class="label">{label}</span>
							{/each}
						</li>

						{#if cardDraggable && hoveringCard === i && hoveringColumn === j && hoveringBottom && (draggedCard !== i || j !== draggedCardColumn)}
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
						class="empty"
						draggable={false}
						on:drop|preventDefault={(event) =>
							cardDrop(event, board.columns[j].cards.length, j, hoveringBottom)}
						on:dragover={(ev) => {
							ev.preventDefault();
						}}
						on:dragenter={(e) => cardDragEnter(e, board.columns[j].cards.length, j)}
						on:dragend={reset}
						class:is-active={hoveringCard === board.columns[j].cards.length && hoveringColumn === j}
						class:hovering-top={hoveringCard === board.columns[j].cards.length &&
							hoveringColumn === j &&
							hoveringTop}
					>
						<h5>Add another card</h5>
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
	</div>
</section>

<style lang="scss">
	.invitation-modal {
		display: flex;
		flex-direction: column;
		padding: 40px 0;

		input,
		label {
			width: 100%;
			margin-top: 10px;
		}
	}
	.container {
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

				h4 {
					color: $black;
				}

				ul {
					padding: 0;
					margin: 0;

					.empty {
						cursor: default;
					}

					li,
					.preview-drop {
						background-color: rgba(255, 255, 255, 0.9);
						list-style: none;
						padding: 30px 10px;
						border-radius: 8px;
						box-shadow: 0px 4px 12px 0px #0000000d;
						cursor: move;
						margin-bottom: 20px;
						min-height: 150px;
					}

					.preview-drop {
						height: 50px;
						padding: 0;
						background-color: grey;

						&.bottom {
							margin-top: -20px;
						}
					}
				}
			}
		}
	}
</style>
