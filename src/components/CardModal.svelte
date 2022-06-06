<script lang="ts">
	import type { Column, Label, User } from '@prisma/client';
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
	import plusCircle from 'svelte-awesome/icons/plusCircle';
	import trashO from 'svelte-awesome/icons/trashO';
	import { clickOutside } from '../utils/clickOutside';
	import { isLight, isWhitish } from '../utils/color';
	import plus from 'svelte-awesome/icons/plus';
	import Select from 'svelte-select';
	import { session } from '$app/stores';

	export let open: boolean;
	export let selectedColumn: Column | null;
	export let boardMembers: User[] = [];
	export let card: Partial<{
		id: string;
		title: string;
		description: string;
		date: Date | null;
		users: User[];
		labels: Label[];
		cover: string | null;
	}> & { new?: boolean } = {
		title: '',
		description: '',
		date: new Date(),
		labels: [],
		users: [],
		cover: null,
		new: false
	};

	let files: FileList;
	let coverInput: HTMLInputElement | null = null;

	function getBase64(_image: Blob) {
		const reader = new FileReader();
		reader.readAsDataURL(_image);
		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target) {
				card.cover = e.target.result?.toString();

				if (!card.new) {
					updateCard();
				}
			}
		};
	}

	const dispatch = createEventDispatcher();

	const handleClose = () => {
		dispatch('close');
	};

	const createCard = async () => {
		try {
			const body = { ...card, columnId: selectedColumn?.id };

			const res = await axios.post('/card/create', body);

			handleClose();

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

	const deleteCard = async () => {
		try {
			const res = await axios.delete(`/card/${card.id}/api/delete`);

			handleClose();

			toast.push('Card deleted successfully');
		} catch (error) {
			handleError(error);
		}
	};

	const createLabel = async (label: {
		title: string;
		color: string;
		cardId: string | undefined;
	}) => {
		try {
			const res = await axios.post('/label/create', label);

			toast.push('Label created successfully');

			return res.data;
		} catch (error) {
			handleError(error);

			return null;
		}
	};

	const deleteLabel = async (id: string) => {
		try {
			if (card.new) {
				card.labels = card.labels?.filter((label) => label.id !== id);
			} else {
				const res = (await axios.delete(`/label/${id}/api/delete`)).data;

				card.labels = card.labels?.filter((label) => label.id !== res.id);

				toast.push('Label deleted successfully');
			}
		} catch (error) {
			handleError(error);
		}
	};

	const addMemberToCard = async (user: User, cardId: string) => {
		try {
			const res = (await axios.patch(`/card/addUserToCard`, { cardId, userId: user.id })).data;

			toast.push('Member added successfully');

			return res;
		} catch (error) {
			handleError(error);

			return null;
		}
	};

	const removeMemberFromCard = async (user: User, cardId: string) => {
		try {
			const res = (await axios.patch(`/card/removeUserFromCard`, { cardId, userId: user.id })).data;

			toast.push('Member removed successfully');

			return res;
		} catch (error) {
			handleError(error);

			return null;
		}
	};

	let labelDropdown = false;
	let labelDropdownRef: HTMLElement;
	let labelInput = '';
	let labelColorInput = '#2f80ed';

	const addLabel = async () => {
		if (!labelInput) return;

		const label = {
			title: labelInput,
			color: labelColorInput,
			cardId: card.id,
			id: Date.now().toString()
		};

		if (card.new) {
			card.labels?.push(label as Label);
			card.labels = card.labels;
			labelInput = '';
		} else {
			const newLabel = await createLabel(label);

			if (newLabel) {
				card.labels?.push(newLabel);
				card.labels = card.labels;
				labelInput = '';
			}
		}
	};

	let membersDropdown = false;
	let membersDropdownRef: HTMLElement;
	$: addableMembers = boardMembers
		.map((m) => m.fullname)
		.filter((m) => !card.users?.find((u) => u.fullname === m));
	$: memberInput = addableMembers[0] ?? '';

	// $: setAddableMembers = () =>
	// 	(addableMembers = boardMembers
	// 		.map((m) => m.fullname)
	// 		.filter((m) => !card.users?.find((u) => u.fullname === m)));

	const addMember = async () => {
		const user = boardMembers.find((u) => u.fullname === memberInput);
		if (!user) return;

		if (card.new) {
			card.users?.push(user);
			card.users = card.users;
		} else {
			if (!card.id) return;

			const newMember = await addMemberToCard(user, card.id);

			if (newMember) {
				card.users?.push(user);
				card.users = card.users;
			}
		}
	};

	const removeMember = async (user: User) => {
		console.log(user);

		if (card.new) {
			card.users = card.users?.filter((u) => u.id !== user.id);
		} else {
			if (!card.id) return;

			const res = await removeMemberFromCard(user, card.id);

			if (res) {
				card.users = card.users?.filter((u) => u.id !== user.id);
			}
		}
	};
</script>

{#if open && selectedColumn}
	<Modal
		{open}
		header=""
		footerButton=""
		on:create={() => {}}
		on:close={handleClose}
		backdropClose={!labelDropdown && !membersDropdown}
	>
		{#if card.cover}
			<img class="uploaded-cover" src={card.cover} alt="Uploaded" />
		{/if}

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
						<label for="cover-upload" class=" li icon-group">
							<Icon class="icon" data={photo} />

							<input
								class="hidden"
								id="cover-upload"
								type="file"
								accept=".png,.jpg,.jpeg"
								bind:files
								bind:this={coverInput}
								on:change={() => getBase64(files[0])}
							/>

							<span>Cover</span>
						</label>

						<li
							bind:this={labelDropdownRef}
							class="icon-group"
							on:click={() => (labelDropdown = true)}
						>
							<Icon class="icon" data={tags} />

							<span>Labels</span>
						</li>
					</ul>
				</div>

				<div class="members">
					<div class="icon-group">
						<Icon class="icon" data={users} />

						<span>Members</span>
					</div>

					<div
						class="blue-btn"
						bind:this={membersDropdownRef}
						on:click={() => (membersDropdown = true)}
					>
						<Icon data={plusCircle} />
						<span>Add</span>
					</div>
				</div>

				{#if card.new}
					<button class="black-btn" on:click={createCard}>
						<Icon data={plus} />
						<span>Create</span>
					</button>
				{:else}
					<button class="red-btn" on:click={deleteCard}>
						<Icon data={trashO} />
						<span>Delete</span>
					</button>
				{/if}
			</div>
		</div>
	</Modal>

	{#if labelDropdown}
		<div
			use:clickOutside
			on:click_outside={() => {
				labelDropdown = false;
			}}
			class="label-dropdown"
			style="
			top:{labelDropdownRef?.getBoundingClientRect().top +
				labelDropdownRef?.getBoundingClientRect().height +
				10}px;
			left: {labelDropdownRef?.getBoundingClientRect().left - 75}px;"
		>
			<div>
				<input class="color-pick" type="color" bind:value={labelColorInput} />
				<input type="text" bind:value={labelInput} placeholder="New label" />

				<button class="blue-btn" on:click={addLabel}>+ Add</button>
			</div>

			{#if card.labels}
				<div class="existant-labels">
					{#each card.labels as label}
						<span
							style="background-color: {isWhitish(label.color)
								? '#2f80ed'
								: label.color}; color: {!isLight(label.color) || isWhitish(label.color)
								? '#fff'
								: '#000'}; "
						>
							{label.title}

							<span on:click={async () => await deleteLabel(label.id)}>
								<Icon data={trashO} />
							</span>
						</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if membersDropdown}
		<div
			use:clickOutside
			on:click_outside={() => {
				membersDropdown = false;
			}}
			class="members-dropdown"
			style="
			top:{membersDropdownRef?.getBoundingClientRect().top +
				membersDropdownRef?.getBoundingClientRect().height +
				10}px;
			left: {membersDropdownRef?.getBoundingClientRect().left - 75}px;"
		>
			<div>
				{#if addableMembers.length > 0}
					<Select
						on:select={(e) => (memberInput = e.detail.value)}
						value={memberInput}
						items={addableMembers}
						containerClasses="select"
						isClearable={false}
					/>

					<button class="blue-btn" on:click={addMember}>+ Add</button>
				{/if}
			</div>

			{#if card.users}
				<div class="existant-users">
					{#each card.users as user}
						<div>
							<Avatar
								src={user.image ? user.image : ''}
								width={32}
								round={false}
								userFullName={user?.fullname || ''}
							/>

							<span on:click={() => removeMember(user)}>
								<Icon data={trashO} />
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style lang="scss">
	.uploaded-cover {
		display: block;
		width: 100%;
		max-height: 200px;
		margin: auto;
		margin-bottom: 20px;
	}
	:global(.modal) {
		width: 50vw !important;
		max-width: 1024px;
		padding-top: 30px !important;

		:global(.modal-header) {
			margin-top: -10px;
			:global(.close) {
				position: absolute;
				right: 10px;
				z-index: 2;
				top: 10px;
			}
		}

		:global(.modal-body) {
			position: relative;
			z-index: 1;
		}

		@media (max-width: 1024px) {
			width: 75vw !important;
		}

		@media (max-width: 650px) {
			width: 95vw !important;
			padding-top: 10px !important;
		}
	}

	.hidden {
		display: none;
	}

	.label-dropdown,
	.members-dropdown {
		position: absolute;
		z-index: 333;
		background-color: white;
		border-radius: 8px;
		width: 300px;
		box-shadow: 2px 2px 6px #000;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px;
	}

	.label-dropdown {
		> div {
			display: flex;
			align-items: center;
			width: 100%;
		}
		input {
			width: 60%;
		}

		.color-pick {
			width: 30px;
			margin: 0;
			height: 40px;
			padding: 0;
		}

		button {
			padding: 10px;
			font-size: 16px;
			height: fit-content;
		}

		.existant-labels {
			display: flex;
			flex-wrap: wrap;

			span {
				:global(svg) {
					margin-left: 5px;
					cursor: pointer;
				}

				span {
					margin: 0;
				}

				border-radius: 5px;
				margin-right: 10px;
				margin-top: 8px;
				height: 20px;
				padding: 5px 10px;
				font-size: 15px;
				height: fit-content;
				display: flex;
				align-items: center;
			}
		}
	}

	:global(.select) {
		width: 70%;
	}

	.members-dropdown {
		> div {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			width: 100%;
		}

		.existant-users {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;

			> div {
				position: relative;

				:global(svg) {
					margin-left: 5px;
					cursor: pointer;
					position: absolute;
					bottom: 8px;
					color: red;
					right: 10px;
				}
			}

			:global(.avatar-container) {
				margin: 10px 10px 10px 0;
			}
		}
	}

	.container {
		display: flex;
		justify-content: space-between;

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
				width: 65%;
			}

			&.column-second {
				width: 30%;
				align-items: center;

				> div,
				button {
					width: 80%;
				}

				.icon-group {
					color: grey;
				}

				.settings {
					ul {
						padding: 0;
						margin: 20px 0 30px;

						li,
						.li {
							background-color: lightgrey;
							padding: 10px;
							border-radius: 8px;
							color: $black;
							margin-bottom: 10px;
							cursor: pointer;
							transition: 0.3s all;

							&:hover {
								background-color: darken(lightgrey, 10%);
							}
						}
					}
				}

				.blue-btn,
				.black-btn {
					display: flex;
					align-items: center;
					margin-top: 10px;
					font-size: 16px;
					border-radius: 8px;
					padding: 10px;
					cursor: pointer;

					span {
						margin-left: 15px;
					}
				}

				.black-btn {
					margin-top: 30px;
				}

				.red-btn {
					background-color: red;
					color: white;
					display: flex;
					align-items: center;
					padding: 10px;
					border-radius: 8px;
					font-size: 16px;
					transition: 0.3s all;

					&:hover {
						background-color: darken(red, 5%);
					}

					span {
						margin-left: 15px;
					}
				}
			}
		}

		@media (max-width: 650px) {
			flex-direction: column;

			.column {
				width: 100% !important;

				&.column-second {
					margin-top: 25px;

					> div,
					button {
						width: 100%;
					}
				}
			}
		}
	}
</style>
