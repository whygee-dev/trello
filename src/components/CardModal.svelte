<script lang="ts">
    import type { Card } from '@prisma/client';
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from '../utils/clickOutside';
    import axios from 'axios';
    import { toast } from '@zerodevx/svelte-toast';
    import { handleError } from '../utils/errorHandler';

	export let open: boolean;
    export let selectedColumn: string | null;
    export let card = {
        title: "",
        description: "",
        date: ""
    };

	const dispatch = createEventDispatcher();

	const handleClose = () => {
		dispatch('close');
	};

    const createCard = async () => {
		try {
			const res = await axios.post('/card/create', {
				columnId: selectedColumn,
				title: card.title,
				description: card.description,
				date: new Date(card.date!)
			});

			toast.push('Card created successfully');
		} catch (error) {
			handleError(error);
		}
	};

/* const updateCard = async (id: string | null) => {
		if (!id || !editingCard) return;

		try {
			const res = await axios.patch(`/card/${id}/api/update`, {
				title: cardTitle,
				description: cardDescription,
				date: new Date()
			});

			cardModalOpen = false;

			requestSync();

			toast.push('Card updated successfully');
		} catch (error) {
			handleError(error);
		}
	};

	const deleteCard = async (id: string) => {
		try {
			const res = await axios.delete(`/card/${id}/api/delete`);

			requestSync();

			toast.push('Card deleted successfully');
		} catch (error) {
			handleError(error);
		}
	};

    const createLabel = async () => {
		try {
			const res = await axios.post('/label/create', {
				cardId: editingCard,
				title: labelTitle,
				color: labelColor
			});

			const labelsRes = await axios.post(`/label/getAllByCard`, {
				cardId: editingCard
			});
			cardLabels = await labelsRes.data;

			labelTitle = '';
			labelColor = '';

			requestSync();

			toast.push('Label created successfully');
		} catch (error) {
			handleError(error);
		}
	};

	const deleteLabel = async (id: string | null) => {
		try {
			const res = await axios.delete(`/label/${id}/api/delete`);

			const labelsRes = await axios.post(`/label/getAllByCard`, {
				cardId: editingCard
			});
			cardLabels = await labelsRes.data;

			requestSync();

			toast.push('Label deleted successfully');
		} catch (error) {
			handleError(error);
		}
	}; */
</script>

{#if open}
    <div class="backdrop" class:open />
    <section class="modal" use:clickOutside on:click_outside={handleClose} class:open>

        {#if !card.title}
            <div class="modal-header">
                <h3>Create a new card</h3>
                <button class="close blue-btn" on:click={handleClose}>
                    <span>&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <input type="text" bind:value={card.title}  placeholder="Title" />
                <input type="text" bind:value={card.description} placeholder="Description" />
                <input type="date" bind:value={card.date} />
            </div>
            <div class="modal-footer">
                <button class="blue-btn" on:click={() => createCard()}>+ Create</button>
            </div>

        {:else}
            <div class="modal-header">
                <h3>{card.title}</h3>
                <button class="close blue-btn" on:click={handleClose}>
                    <span>&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <span>{card.date}</span>
                
                <h4>Description</h4>
                <span>{card.description}</span>                
            </div>
        {/if}
    </section>
{/if}

<style lang="scss">
	.backdrop {
		display: none;

		&.open {
			display: block;
		}

		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background: black;
		opacity: 0.5;
	}

	.modal {
		position: fixed;
		left: 50%;
		top: 50%;
		width: clamp(500px, 30vw, 700px);
		transform: translate(-50%, -50%);
		background-color: white;
		display: none;
		border-radius: 12px;
		padding: 20px;

		@media (max-width: 600px) {
			width: 90vw;
		}

		&.open {
			display: flex;
			flex-direction: column;
		}

		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;

			h3 {
				margin: 0;
			}

			button {
				padding: 0 10px;

				font-size: 30px;
				font-weight: 700;
			}
		}

        .modal-body {
            display: flex;
            flex-direction: column;
            padding: 40px 0;

            input {
                width: 100%;
                margin-top: 10px;
            }
		}

		.modal-footer {
			button {
				margin-left: auto;
				display: block;
			}
		}
	}
</style>
