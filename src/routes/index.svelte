<script lang="ts">
	let email: string = '';
</script>

<svelte:head>
	<title>Thullo</title>
</svelte:head>

<section class="container">
	<div class="home-page-container">
		<div class="primary-description">
			<h1>Thullo helps teams move work forward.</h1>
			<p>Collaborate, manage projects, and reach new productivity peaks. From high rises to the home office, the way your team works is unique—accomplish it all with Thullo.</p>
			<form>
				<input class="email-input-primary" type="email" required placeholder="Email" bind:value={email} />
				<button class="primary-btn" type="submit">Sign up, it's free!</button>
			</form>

			<!-- <img src={"hero.png"} alt="" width="931" height="1905"> -->
		</div>

		<div class="second-description">
			<h1>It’s more than work. It’s a way of working together.</h1>
			<p>Start with a Thullo board, lists, and cards. Customize and expand with more features as your teamwork grows. Manage projects, organize tasks, and build team spirit—all in one place.</p>
			<button class="secondary-btn" type="submit">Start doing →</button>

			<!-- Screen du tableau de board -->
		</div>

		<div class="third-description">
			<h3>
				Sign up and get started with Thullo today.
				A world of productive teamwork awaits!
			</h3>
			<form>
				<input type="email" required placeholder="Email" bind:value={email} />
				<button class="tertiary-btn" type="submit">Sign up</button>
			</form>
		</div>
	</div>
</section>

<style lang="scss">
	h1 {
		margin-bottom: -1vh;
		color: #091e42;
	}

	p {
		font-size: 1.25rem;
		color: #091e42;
	}

	button {
		color: white;
		font-size: 1rem;
		font-weight: 500;
		transition: all .2s;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 100%;
	}

	.home-page-container {
		margin-left: 15vw;
		margin-right: 15vw;
		margin-top: 5rem;
	}

	.primary-description {
		h1 {
			font-size: 2.5rem;
		}
	}

	.email-input-primary {
		width: 60%;
	}

	.primary-btn {
		background-color: #0065ff;
		padding-left: 3rem;
		padding-right: 3rem;
		&:hover {
			background-color: #0454dc;
		}
	}

	.second-description {
		text-align: center;
		margin-top: 10rem;
		h1 {
			font-size: 2rem;
		}
	}

	.secondary-btn {
		border: #0065ff 1px solid;
		background-color: white;
		color: #0065ff;
		padding-left: 1rem;
		padding-right: 1rem;
		&:hover {
			background-color: #0454dc;
			color: white;
		}
	}

	.third-description {
		background-image: url('third-paragraph-bg.png');
		background-repeat: round;
		border-radius: 0.5rem;
		text-align: center;
		margin-top: 2rem;
		margin-bottom: 5rem;
		font-size: 1.1rem;
		h3 {
			color: white;
			margin-left: 7.5rem;
			margin-right: 7.5rem;
			padding-top: 3rem;
		}
		form {
			padding-bottom: 2rem;
		}
	}

	.tertiary-btn {
		background-color: #00b8d9;
		padding-left: 1rem;
		padding-right: 1rem;
		&:hover {
			background-color: #009bb7;
		}
	}
</style>
