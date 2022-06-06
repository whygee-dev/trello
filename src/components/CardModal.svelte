<script lang="ts">
	import type { Card, Column, Label } from '@prisma/client';
	import { createEventDispatcher } from 'svelte';
	import axios from 'axios';
	import { toast } from '@zerodevx/svelte-toast';
	import { handleError } from '../utils/errorHandler';
	import Modal from './Modal.svelte';
	import EditableBlock from './EditableBlock.svelte';
	import cogs from 'svelte-awesome/icons/cogs';
	import Icon from 'svelte-awesome';
	import photo from 'svelte-awesome/icons/photo';
	import tags from 'svelte-awesome/icons/tags';
	import users from 'svelte-awesome/icons/users';
	import Avatar from './Avatar.svelte';
	import { Space } from '@svelteuidev/core';
	import fileTextO from 'svelte-awesome/icons/fileTextO';

	export let open: boolean;
	export let selectedColumn: Column | null;
	export let card: Partial<{
		id: string;
		title: string;
		description: string;
		date: Date | null;
		users: User[];
		labels: Label[];
	}> & { new?: boolean } = {
		title: '',
		description: '',
		date: new Date(),
		labels: [],
		users: [],
		new: false
	};

	const dispatch = createEventDispatcher();

	const handleClose = () => {
		dispatch('close');
	};

	const createCard = async () => {
		try {
			const res = await axios.post('/card/create', {
				columnId: selectedColumn!.id,
				title: card.title,
				description: card.description,
				date: new Date(card.date!)
			});

			toast.push('Card created successfully');
		} catch (error) {
			handleError(error);
		}
	};

	const updateCard = async () => {
		try {
			const res = await axios.patch(`/card/${card.id}/api/update`, card);

			toast.push('Card updated successfully');
		} catch (error) {
			handleError(error);
		}
	};

	const deleteCard = async (id: string) => {
		try {
			const res = await axios.delete(`/card/${id}/api/delete`);

			handleClose();

			toast.push('Card deleted successfully');
		} catch (error) {
			handleError(error);
		}
	};

	// const createLabel = async () => {
	// 	try {
	// 		const res = await axios.post('/label/create', {
	// 			cardId: editingCard,
	// 			title: labelTitle,
	// 			color: labelColor
	// 		});

	// 		handleClose();

	// 		toast.push('Label created successfully');
	// 	} catch (error) {
	// 		handleError(error);
	// 	}
	// };

	// const deleteLabel = async (id: string | null) => {
	// 	try {
	// 		const res = await axios.delete(`/label/${id}/api/delete`);

	// 		const labelsRes = await axios.post(`/label/getAllByCard`, {
	// 			cardId: editingCard
	// 		});
	// 		cardLabels = await labelsRes.data;

	// 		handleClose();

	// 		toast.push('Label deleted successfully');
	// 	} catch (error) {
	// 		handleError(error);
	// 	}
	// };
</script>

{#if open && selectedColumn}
	<Modal {open} header="" footerButton="" on:create={() => {}} on:close={handleClose}>
		<div class="container">
			<div class="column column-first">
				{#if !card.new}
					<EditableBlock
						className="title-edit"
						bind:value={card.title}
						placeholder="Title"
						on:save={() => updateCard()}
					/>
				{:else}
					<input type="text" bind:value={card.title} placeholder="Title" />
				{/if}

				<Space h="sm" />

				<div class="in-list">
					{selectedColumn.title}
				</div>

				<Space h="xl" />

				<div class="icon-group">
					<Icon class="icon" data={fileTextO} />
					<span class="desc">Description</span>
				</div>

				<Space h="sm" />

				{#if !card.new}
					<EditableBlock
						className="description-edit"
						bind:value={card.description}
						placeholder="Description"
						on:save={() => updateCard()}
						textarea
					/>
				{:else}
					<textarea bind:value={card.description} placeholder="Description" />
				{/if}
			</div>

			<div class="column column-second">
				<div class="settings">
					<div class="icon-group">
						<Icon class="icon" data={cogs} />

						<span>Actions</span>
					</div>

					<ul>
						<li class="icon-group">
							<Icon class="icon" data={photo} />
							<span>Cover</span>
						</li>

						<li class="icon-group">
							<Icon class="icon" data={tags} />
							<span>Labels</span>
						</li>
					</ul>
				</div>

				<div class="members">
					<div>
						<Icon data={users} />

						<span>Members</span>
					</div>

					{#if card.users}
						<div>
							{#each card.users as user}
								<div>
									<Avatar width={32} round={false} userFullName={user?.fullname || ''} />

									<span>{user?.fullname}</span>
								</div>
							{/each}

							<div>
								<span>Assign a member</span>

								<span>+</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</Modal>
{/if}

<style lang="scss">
	:global(.modal) {
		width: 50vw !important;
	}

	.container {
		display: flex;
		justify-content: space-between;
		height: 70vh;
		input,
		textarea {
			width: 100%;
		}

		:global(.title-edit) {
			color: $black;
			font-weight: 700;
			font-size: 18px;
		}

		.in-list {
			font-size: 16px;
			padding: 8px 12px;
			background-color: $black;
			color: white;
			border-radius: 4px;
			font-weight: 700;
			width: fit-content;
		}

		.desc {
			font-weight: 700;
			font-size: 17px;
		}

		.icon-group {
			display: flex;
			align-items: center;
			.icon {
				width: 18px;
			}
			span {
				margin-left: 15px;
				font-size: 16px;
			}
		}
		.column {
			display: flex;
			flex-direction: column;

			height: 100%;

			&.column-first {
				width: 60%;
			}

			&.column-second {
				width: 30%;
				align-items: center;
			}
		}
	}
</style>
