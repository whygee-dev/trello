<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async ({ session, fetch }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/login'
			};
		}

		try {
			const response = await fetch('/workspace/getAllWorkSpaces');

			const json = await response.json();

			return {
				status: response.status,
				props: {
					workspaces: json ?? []
				}
			};
		} catch (error) {
			console.error('err', error);
		}

		return {
			status: 400,
			props: {
				workspaces: []
			}
		};
	};
</script>

<script lang="ts">
	import type { Board, WorkSpace } from '@prisma/client';
	import Avatar from '../../components/Avatar.svelte';
	import Modal from '../../components/Modal.svelte';
	import axios from 'axios';
	import { toast } from '@zerodevx/svelte-toast';
	import { handleError } from '../../utils/errorHandler';
	import { invalidate } from '$app/navigation';
	import trashO from 'svelte-awesome/icons/trashO';
	import edit from 'svelte-awesome/icons/edit';
	import { session } from '$app/stores';
	import Icon from 'svelte-awesome';

	export let workspaces: (WorkSpace & {
		users: User[];
		boards: Board[];
		owner: User;
	})[] = [];

	let boardModalOpen = false;
	let workspaceModalOpen = false;
	let editingBoard: string | null = null;
	let editingWorkspace = false;
	let selectedWorkspace: string | null = null;
	let boardTitle = '';
	let boardDescription: string | null = '';
	let workspaceTitle = '';
	let workspaceDescription = '';
	let imageInput: HTMLInputElement | null = null;
	let files: FileList;
	let image: string | ArrayBuffer | null = null;

	function getBase64(_image: Blob) {
		const reader = new FileReader();
		reader.readAsDataURL(_image);
		reader.onload = (e: ProgressEvent<FileReader>) => {
			if (e.target) {
				image = e.target.result;
			}
		};
	}

	const createBoard = async (workspace: string | null) => {
		if (!workspace) return;

		try {
			const imgData = image;

			const res = await axios.post('/board/create', {
				title: boardTitle,
				description: boardDescription,
				image: image,
				workspaceId: workspace
			});

			toast.push('Board created successfully');
			boardModalOpen = false;

			invalidate('/workspace/getAllWorkSpaces');
		} catch (error: any) {
			handleError(error);
		}
	};

	const createWorkspace = async () => {
		try {
			const res = await axios.post('/workspace/create', {
				title: workspaceTitle,
				description: workspaceDescription
			});

			toast.push('Workspace created successfully');
			workspaceModalOpen = false;
			workspaceTitle = '';
			workspaceDescription = '';
			invalidate('/workspace/getAllWorkSpaces');
		} catch (error) {
			handleError(error);
		}
	};

	const deleteWorkspace = async (id: string) => {
		try {
			const res = await axios.delete(`/workspace/${id}/delete`);

			toast.push('Workspace deleted successfully');

			invalidate('/workspace/getAllWorkSpaces');
		} catch (error) {
			handleError(error);
		}
	};

	const deleteBoard = async (id: string) => {
		try {
			const res = await axios.delete(`/board/${id}/api/delete`);

			toast.push('Board deleted successfully');

			invalidate('/workspace/getAllWorkSpaces');
		} catch (error) {
			console.log(error);
			handleError(error);
		}
	};

	const updateBoard = async (id: string | null) => {
		if (!id || !editingBoard) return;

		try {
			const imgData = image?.toString().split(',');

			const res = await axios.patch(`/board/${id}/api/update`, {
				title: boardTitle,
				description: boardDescription,
				image: image
			});

			toast.push('Board updated successfully');
			boardModalOpen = false;

			invalidate('/workspace/getAllWorkSpaces');
		} catch (error) {
			console.log(error);
			handleError(error);
		}
	};
</script>

<svelte:head>
	<title>Boards | Trullo</title>
</svelte:head>

<Modal
	header={editingBoard ? 'Update ' + boardTitle : 'Create a new Board'}
	footerButton={editingBoard ? 'Update' : '+ Create'}
	open={boardModalOpen}
	on:close={() => (boardModalOpen = false)}
	on:create={() => (editingBoard ? updateBoard(editingBoard) : createBoard(selectedWorkspace))}
>
	<div class="board-modal">
		<input type="text" bind:value={boardTitle} placeholder="Title" />
		<input type="text" bind:value={boardDescription} placeholder="Description" />
		<label for="file-upload" class="custom-file-upload"> Upload a background image </label>
		<input
			class="hidden"
			id="file-upload"
			type="file"
			accept=".png,.jpg,.jpeg"
			bind:files
			bind:this={imageInput}
			on:change={() => getBase64(files[0])}
		/>

		<img
			class="uploaded-image"
			src={image
				? image.toString().startsWith('board')
					? image + '?' + Date.now()
					: image.toString()
				: '/default-board.png'}
			alt="Uploaded"
		/>
	</div>
</Modal>
<Modal
	footerButton="+ Create"
	header="Create a new Workspace"
	open={workspaceModalOpen}
	on:close={() => (workspaceModalOpen = false)}
	on:create={createWorkspace}
>
	<div class="workspace-modal">
		<input type="text" bind:value={workspaceTitle} placeholder="Title" />
		<input type="text" bind:value={workspaceDescription} placeholder="Description" />
	</div>
</Modal>

<section class="container container-blue">
	<section class="control">
		<h3>All workspaces</h3>
		<button class="blue-btn" on:click={() => (workspaceModalOpen = true)}>+ Add Workspace</button>
	</section>

	<section class="workspaces">
		{#each workspaces as workspace}
			<div class="workspace">
				<div class="header">
					<h4>
						{workspace.title}

						{#if workspace.owner?.email === $session.user?.email}
							<span on:click={() => deleteWorkspace(workspace.id)}><Icon data={trashO} /></span>
						{/if}
					</h4>

					<div class="members">
						{#each workspace.users as user}
							<div class="member">
								<Avatar
									starred={user?.id === workspace.ownerId}
									width={28}
									userFullName={user?.fullname ?? ''}
								/>
							</div>
						{/each}
					</div>
				</div>

				<div class="boards">
					{#each workspace.boards as board}
						<div class="board">
							<a class="board-link" href={'/board/' + board.id}>
								<img src={board.image ? board.image : '/default-board.png'} alt="Board" />

								<h5>{board.title}</h5>
							</a>

							{#if workspace.owner && workspace.owner.email === $session.user?.email}
								<div class="buttons">
									<button
										class="edit blue-btn"
										on:click={() => {
											editingBoard = board.id;
											boardTitle = board.title;
											boardDescription = board.description;
											image = board.image;
											boardModalOpen = true;
										}}><Icon data={edit} /> Edit</button
									>
									<button class="delete blue-btn" on:click={() => deleteBoard(board.id)}>
										<Icon data={trashO} />Delete</button
									>
								</div>
							{/if}
						</div>
					{/each}

					{#if workspace.owner && workspace.owner.email === $session.user?.email}
						<div
							class="create-board"
							on:click={() => {
								editingBoard = null;
								selectedWorkspace = workspace.id;
								boardTitle = '';
								boardDescription = '';
								image = '';
								boardModalOpen = true;
							}}
						>
							<h5>+ Add board</h5>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</section>
</section>

<style lang="scss">
	.uploaded-image {
		width: 300px;
		margin: auto;
		margin-top: 40px;
	}

	.board-modal,
	.workspace-modal {
		display: flex;
		flex-direction: column;
		padding: 40px 0;

		input,
		label {
			width: 100%;
			margin-top: 10px;
		}
	}

	input[type='file'] {
		display: none;
	}

	.custom-file-upload {
		border: 1px solid $blue;
		background-color: $light-blue;
		color: white;
		display: inline-block;
		padding: 6px 10px;
		cursor: pointer;
		border-radius: 4px;
		width: 50% !important;
		text-align: center;

		@media (max-width: 560px) {
			width: 75% !important;
			font-size: 14px;
		}
	}

	.container {
		width: 100%;
		max-width: 950px;
		margin: auto;
		padding: 0 20px;

		.control {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 50px;

			h3 {
				margin: 0;
			}

			button {
				font-size: 16px;
				padding: 8px 15px;
			}
		}

		:global(svg) {
			width: 24px;
			height: 24px;
			cursor: pointer;
			margin-left: 5px;
		}

		.workspaces {
			display: flex;
			flex-direction: column;

			.workspace {
				margin: 70px 0 30px;
			}

			.header {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.members {
					display: flex;
					.member {
						margin-left: 5px;
					}
				}

				:global(img) {
					border-radius: 8px;
				}
			}
			h4 {
				:global(svg) {
					color: red;
				}

				display: flex;
				align-items: center;
				margin: 0;
				margin-bottom: 20px;
			}

			.members {
				position: 'relative';
			}
			.boards {
				display: flex;

				flex-wrap: wrap;

				@media (max-width: 600px) {
					justify-content: space-around;
				}

				.board {
					background-color: white;
					width: 250px;
					padding: 15px;
					margin: 0 30px 10px 0;
					border-radius: 12px;
					box-shadow: 0px 4px 12px 0px #0000000d;

					.buttons,
					button {
						display: flex;
						align-items: center;
						justify-content: space-between;
					}

					.delete {
						background-color: red;

						&:hover {
							background-color: darken(red, 10%) !important;
						}
					}

					:global(svg) {
						margin-right: 5px;
						width: 20px;
						height: 20px;
					}
				}

				.board-link {
					text-decoration: none;
					color: black;
					margin: 0;
					width: 100%;
					height: 250px;
					display: flex;
					flex-direction: column;
					justify-content: space-between;

					h5 {
						margin-top: auto;
					}

					img {
						max-height: 150px;
						max-width: 100%;
						border-radius: 12px;
						margin: auto;
						display: block;
					}
				}

				.create-board {
					margin: auto 30px auto 0;
					border-radius: 12px;
					box-shadow: 0px 4px 12px 0px #0000000d;
					background-color: #2f80ed;
					display: flex;
					justify-content: center;
					align-items: center;
					color: white;
					width: 200px;
					height: 100px;

					cursor: pointer;
					transition: 0.3s all;

					&:hover {
						background-color: darken(#2f80ed, 10%);
					}

					h5 {
						font-size: 28px;
						text-align: center;
					}
				}
			}
		}
	}
</style>
