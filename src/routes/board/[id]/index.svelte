<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
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

			for (let i = 0; i < 3; i++) {
				board.columns[0].cards.push(
					...board.columns[0].cards.map((c: any) => {
						return { ...c, id: String(Math.floor(Math.random() * 100)) };
					})
				);
			}

			for (let i = 0; i < 3; i++) {
				board.columns.push(
					...board.columns.map((c) => {
						return { ...c, cards: [...c.cards] };
					})
				);
			}

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
	import { flip } from 'svelte/animate';
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
	let lastMousePost = { x: -1, y: -1 };

	const drop = (event: any, cardTarget: number, columnTarget: number, bottom: boolean) => {
		event.dataTransfer.dropEffect = 'move';
		const data = JSON.parse(event.dataTransfer.getData('text/plain'));

		if (!data) return;

		if (typeof data.card === 'undefined' || typeof data.column === 'undefined') {
			console.log('returned');
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

		hoveringCard = -1;
		hoveringColumn = -1;
		hoveringBottom = false;
		hoveringTop = false;
	};

	const dragstart = (event: any, i: number, j: number) => {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		const card = i;
		const column = j;

		event.dataTransfer.setData('text/plain', JSON.stringify({ card, column }));
	};

	const reset = () => {
		hoveringBottom = false;
		hoveringTop = false;
		hoveringCard = -1;
		hoveringColumn = -1;
	};

	let dragTimeout: NodeJS.Timeout;

	const dragenter = (e: any, i: number, j: number) => {
		clearTimeout(dragTimeout);

		dragTimeout = setTimeout(() => {
			console.log('pass');
			hoveringCard = i;
			hoveringColumn = j;
			hoveringBottom = e.clientY > lastMousePost.y && i !== board.columns[j].cards.length;
			hoveringTop = e.clientY < lastMousePost.y;

			lastMousePost = { y: e.clientY, x: e.clientX };
		}, 100);
	};
</script>

<svelte:head>
	<title>Board | {board.title}</title>
</svelte:head>

<section class="container">
	<div class="users">
		{#each board.workSpace.users as user}
			{#if user}
				<Avatar width={32} round={false} userFullName={user.fullname} />
			{/if}

			<button class="add">+</button>
		{/each}
	</div>

	<div class="columns scrollable">
		{#each board.columns as column, j}
			<div class="column">
				<h4>{column.title}</h4>
				<ul>
					{#each column.cards as card, i (card.id + i)}
						{#if hoveringCard === i && hoveringColumn === j && hoveringTop}
							<div
								class="preview-drop top"
								on:drop|preventDefault={(event) => drop(event, i, j, hoveringBottom)}
								on:dragover={(ev) => {
									ev.preventDefault();
								}}
								on:dragenter={(e) => dragenter(e, i, j)}
								on:dragend={reset}
							/>
						{/if}
						<li
							draggable={true}
							on:dragstart={(event) => dragstart(event, i, j)}
							on:drop|preventDefault={(event) => drop(event, i, j, hoveringBottom)}
							on:dragover={(ev) => {
								ev.preventDefault();
							}}
							on:dragenter={(e) => dragenter(e, i, j)}
							on:dragend={reset}
						>
							<h5>
								{card.title}
								{card.id}
							</h5>

							{#each card.labels as label}
								<span class="label">{label}</span>
							{/each}
						</li>

						{#if hoveringCard === i && hoveringColumn === j && hoveringBottom}
							<div
								class="preview-drop bottom"
								on:drop|preventDefault={(event) => drop(event, i, j, hoveringBottom)}
								on:dragover={(ev) => {
									ev.preventDefault();
								}}
								on:dragenter={(e) => dragenter(e, i, j)}
								on:dragend={reset}
							/>
						{/if}
					{/each}

					{#if hoveringCard === board.columns[j].cards.length && hoveringColumn === j && hoveringTop}
						<div
							class="preview-drop bottom"
							on:drop|preventDefault={(event) =>
								drop(event, board.columns[j].cards.length, j, hoveringBottom)}
							on:dragover={(ev) => {
								ev.preventDefault();
							}}
							on:dragenter={(e) => dragenter(e, board.columns[j].cards.length, j)}
							on:dragend={reset}
						/>
					{/if}

					<li
						class="empty"
						draggable={false}
						on:drop|preventDefault={(event) =>
							drop(event, board.columns[j].cards.length, j, hoveringBottom)}
						on:dragover={(ev) => {
							ev.preventDefault();
						}}
						on:dragenter={(e) => dragenter(e, board.columns[j].cards.length, j)}
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
		{/each}
	</div>
</section>

<style lang="scss">
	.container {
		padding: 1rem 0 0;

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
			padding: 0 1rem;

			:global(img),
			button {
				margin-right: 10px !important;
			}
		}

		.columns {
			padding-top: 30px;
			display: flex;
			overflow-x: auto;
			height: calc(100vh - 70px - 30px - 20px);

			.column {
				width: 250px;
				min-width: 250px;
				margin: 0 30px;

				ul {
					padding: 0;
					margin: 0;

					.empty {
						cursor: default;
					}

					li,
					.preview-drop {
						background-color: white;
						list-style: none;
						padding: 100px 10px;
						border-radius: 8px;
						box-shadow: 0px 4px 12px 0px #0000000d;
						cursor: move;
						margin-bottom: 20px;
					}

					.preview-drop {
						height: 50px;
						padding: 0;
						background-color: grey;

						&.top {
							margin-bottom: 0px;
						}

						&.bottom {
							margin-top: -20px;
						}
					}
				}
			}
		}
	}
</style>
