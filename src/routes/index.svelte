<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	// @ts-ignore
	import { inview } from 'svelte-inview';

	let y: number;
	let email = '';
	let email2 = '';
	let learnMore1Hidden = true;
	let learnMore2Hidden = true;
	let duration: number;
	let visible = false;

	let inViewMap: { [key: string]: boolean } = {
		features: false,
		feature1: false,
		signup: false
	};

	$: innerWidth = 0;

	const onSignup = () => {
		goto(`/register?email=${email || email2}`);
	};

	const handleInView = (id: string, event: any) => {
		inViewMap[id] = event.detail.inView;
	};

	afterNavigate(({ from }) => {
		duration = from === null ? 600 : 0;

		visible = true;
	});
</script>

<svelte:head>
	<title>Thullo</title>
	<meta
		name="description"
		content="Infinitely flexible. Incredibly productive for teams of all sizes. Thullo manages everything, from big project details to micro tasks. Collaborate anywhere, even on mobile."
	/>
	<meta property="og:title" content="Thullo" />
	<meta
		property="og:description"
		content="Infinitely flexible. Incredibly productive for teams of all sizes. Thullo manages everything, from big project details to micro tasks. Collaborate anywhere, even on mobile."
	/>

	<meta
		property="og:image"
		content="https://d2k1ftgv7pobq7.cloudfront.net/meta/p/res/images/spirit/18746ed563cbe964e146d69d8e72f5ff/unfurl.png"
	/>
</svelte:head>

<svelte:window bind:scrollY={y} bind:innerWidth />

<section class="container">
	{#if visible}
		<nav class:scrolling={y > 0} in:fly={{ duration, y: -50 }}>
			<a href="/">
				{#if innerWidth <= 568}
					<img src="logo-sm.svg" alt="App logo" width="75" height="36" />
				{:else}
					<img src="logo.svg" alt="App logo" width="136" height="36" />
				{/if}
			</a>

			<div class="buttons">
				<a href="/login">Log in</a>
				<a href="/register" class="btn">Sign up</a>
			</div>
		</nav>
		<div class="hero" in:fly={{ duration, y: -50 }}>
			<div class="text">
				<h1>Thullo helps teams move work forward.</h1>

				<p>
					Collaborate, manage projects, and reach new productivity peaks. From high rises to the
					home office, the way your team works is unique—accomplish it all with Thullo.
				</p>

				<form on:submit|preventDefault={onSignup}>
					<input class="email" type="email" placeholder="Email" bind:value={email} />
					<button type="submit">Sign up, it's free!</button>
				</form>
			</div>

			<img src="hero.png" alt="Hero" />
		</div>

		<div class="product" in:fly={{ duration, y: -50 }}>
			<h2>It’s more than work. It’s a way of working together.</h2>

			<p>
				Start with a Thullo board, lists, and cards. Customize and expand with more features as your
				teamwork grows. Manage projects, organize tasks, and build team spirit—all in one place.
			</p>

			<a class="btn" href="/register">Start doing →</a>
		</div>
	{:else}
		<nav>
			<a href="/">
				<img src="logo.svg" alt="App logo" width="136" height="36" />
			</a>

			<div class="buttons">
				<a href="/login">Log in</a>
				<a href="/register" class="btn">Sign up</a>
			</div>
		</nav>
		<div class="hero">
			<div class="text">
				<h1>Thullo helps teams move work forward.</h1>

				<p>
					Collaborate, manage projects, and reach new productivity peaks. From high rises to the
					home office, the way your team works is unique—accomplish it all with Thullo.
				</p>

				<form on:submit|preventDefault={onSignup}>
					<input class="email" type="email" placeholder="Email" bind:value={email} />
					<button type="submit">Sign up, it's free!</button>
				</form>
			</div>

			<img src="hero.png" alt="Hero" />
		</div>

		<div class="product">
			<h2>It’s more than work. It’s a way of working together.</h2>

			<p>
				Start with a Thullo board, lists, and cards. Customize and expand with more features as your
				teamwork grows. Manage projects, organize tasks, and build team spirit—all in one place.
			</p>

			<a class="btn" href="/register">Start doing →</a>
		</div>
	{/if}

	<section class="features">
		<span
			use:inview={{ unobserveOnEnter: true, rootMargin: '-250px' }}
			on:change={(event) => handleInView('features', event)}
		/>
		{#if inViewMap['features']}
			<div class="description" in:fly={{ duration, y: -50 }}>
				<h2>Features to help your team succeed</h2>
				<p>
					Powering a productive team means using a powerful tool (and plenty of snacks). From
					meetings and projects to events and goal setting, Trello’s intuitive features give any
					team the ability to quickly set up and customize workflows for just about anything.
				</p>
			</div>
		{:else}
			<div class="description" style="opacity: 0;">
				<h2>Features to help your team succeed</h2>
				<p>
					Powering a productive team means using a powerful tool (and plenty of snacks). From
					meetings and projects to events and goal setting, Trello’s intuitive features give any
					team the ability to quickly set up and customize workflows for just about anything.
				</p>
			</div>
		{/if}

		<span
			use:inview={{ unobserveOnEnter: true, rootMargin: '-250px' }}
			on:change={(event) => handleInView('feature1', event)}
		/>

		{#if inViewMap['feature1']}
			<div class="feature" in:fly={{ duration, y: -50 }}>
				<div class="text">
					<h3>CHOOSE A VIEW</h3>
					<h2>The board is just the beginning</h2>
					<p>
						Lists and cards are the building blocks of organizing work on a Trello board. Grow from
						there with task assignments, timelines, productivity metrics, calendars, and more.
					</p>
					<h3 class="learn-more" on:click={() => (learnMore1Hidden = !learnMore1Hidden)}>
						<span> {learnMore1Hidden ? '+' : '-'} </span><span>Learn more</span>
					</h3>
					<div class="learn-more-content" class:hidden-animated={learnMore1Hidden}>
						<p>
							You and your team can start up a Trello board in seconds. With the ability to view
							board data from many different angles, the entire team stays up-to-date in the way
							that suits them best:
						</p>

						<ul>
							<li>Use a Timeline view for project planning</li>
							<li>Calendar helps with time management</li>
							<li>Table view connects work across boards</li>
							<li>See board stats with Dashboard, and more!</li>
						</ul>
					</div>
				</div>
				<div class="img-container">
					<img src="board.svg" alt="Board" />
				</div>
			</div>
		{:else}
			<div class="feature" style="opacity: 0">
				<div class="text">
					<h3>CHOOSE A VIEW</h3>
					<h2>The board is just the beginning</h2>
					<p>
						Lists and cards are the building blocks of organizing work on a Trello board. Grow from
						there with task assignments, timelines, productivity metrics, calendars, and more.
					</p>
					<h3 class="learn-more" on:click={() => (learnMore1Hidden = !learnMore1Hidden)}>
						<span> {learnMore1Hidden ? '+' : '-'} </span><span>Learn more</span>
					</h3>
					<div class="learn-more-content" class:hidden-animated={learnMore1Hidden}>
						<p>
							You and your team can start up a Trello board in seconds. With the ability to view
							board data from many different angles, the entire team stays up-to-date in the way
							that suits them best:
						</p>

						<ul>
							<li>Use a Timeline view for project planning</li>
							<li>Calendar helps with time management</li>
							<li>Table view connects work across boards</li>
							<li>See board stats with Dashboard, and more!</li>
						</ul>
					</div>
				</div>
				<div class="img-container">
					<img src="board.svg" alt="Board" />
				</div>
			</div>
		{/if}

		<span
			use:inview={{ unobserveOnEnter: true, rootMargin: '-250px' }}
			on:change={(event) => handleInView('feature2', event)}
		/>

		{#if inViewMap['feature2']}
			<div class="feature" in:fly={{ duration, y: -50 }}>
				<div class="text">
					<h3>DIVE INTO THE DETAILS</h3>
					<h2>Cards contain everything you need</h2>
					<p>
						Trello cards are your portal to more organized work—where every single part of your task
						can be managed, tracked, and shared with teammates. Open any card to uncover an
						ecosystem of checklists, due dates, attachments, conversations, and more.
					</p>
					<h3 class="learn-more" on:click={() => (learnMore2Hidden = !learnMore2Hidden)}>
						<span>{learnMore2Hidden ? '+' : '-'} </span> <span>Learn more</span>
					</h3>
					<div class="learn-more-content" class:hidden-animated={learnMore2Hidden}>
						<p>
							Spin up a Trello card with a click, then uncover everything it can hold. Break down
							bigger card tasks into steps with file attachment previews, reminders, checklists and
							comments—emoji reactions included! Plus, gain powerful perspective by seeing all cards
							by list and status at the board level.
						</p>
						<p>Your team can:</p>

						<ul>
							<li>Manage deadlines</li>
							<li>Provide and track feedback</li>
							<li>Assign tasks and hand off work</li>
							<li>Connect work across apps</li>
						</ul>
					</div>
				</div>

				<div class="img-container">
					<img src="card.svg" alt="Cards" />
				</div>
			</div>
		{:else}
			<div class="feature" style="opacity: 0">
				<div class="text">
					<h3>DIVE INTO THE DETAILS</h3>
					<h2>Cards contain everything you need</h2>
					<p>
						Trello cards are your portal to more organized work—where every single part of your task
						can be managed, tracked, and shared with teammates. Open any card to uncover an
						ecosystem of checklists, due dates, attachments, conversations, and more.
					</p>
					<h3 class="learn-more" on:click={() => (learnMore2Hidden = !learnMore2Hidden)}>
						<span>{learnMore2Hidden ? '+' : '-'} </span> <span>Learn more</span>
					</h3>
					<div class="learn-more-content" class:hidden-animated={learnMore2Hidden}>
						<p>
							Spin up a Trello card with a click, then uncover everything it can hold. Break down
							bigger card tasks into steps with file attachment previews, reminders, checklists and
							comments—emoji reactions included! Plus, gain powerful perspective by seeing all cards
							by list and status at the board level.
						</p>
						<p>Your team can:</p>

						<ul>
							<li>Manage deadlines</li>
							<li>Provide and track feedback</li>
							<li>Assign tasks and hand off work</li>
							<li>Connect work across apps</li>
						</ul>
					</div>
				</div>

				<div class="img-container">
					<img src="card.svg" alt="Cards" />
				</div>
			</div>
		{/if}
	</section>

	<span
		use:inview={{ unobserveOnEnter: true }}
		on:change={(event) => handleInView('signup', event)}
	/>

	{#if inViewMap['signup']}
		<section class="signup" in:fly={{ duration, y: -50 }}>
			<h3>Sign up and get started with Thullo today. A world of productive teamwork awaits!</h3>

			<form on:submit|preventDefault={onSignup}>
				<input type="email" placeholder="Email" bind:value={email2} />
				<button type="submit">Sign up</button>
			</form>
		</section>
	{:else}
		<section class="signup" style="opacity: 0">
			<h3>Sign up and get started with Thullo today. A world of productive teamwork awaits!</h3>

			<form on:submit|preventDefault={onSignup}>
				<input type="email" placeholder="Email" bind:value={email2} />
				<button type="submit">Sign up</button>
			</form>
		</section>
	{/if}
</section>

<style lang="scss">
	.container {
		width: 100%;
		padding-bottom: 30px;
		background: linear-gradient(0deg, #fff, #eae6ff 100%);

		nav {
			&.scrolling {
				background-color: white;
				box-shadow: 0 0 10px rgb(0 0 0 / 30%);
			}

			display: flex;
			justify-content: space-between;
			width: 100%;
			padding: 15px 20px;
			position: fixed;
			top: 0;
			transition: background-color 1s ease;

			.buttons {
				display: flex;
				align-items: center;

				a {
					margin-left: 15px;
					padding: 8px;
					color: $blue;
					font-weight: 600;

					&.btn {
						background-color: $blue;
						border-radius: 4px;
						color: white;
						text-decoration: none;

						font-size: 18px;
						font-weight: 500;

						&:hover {
							background-color: $dark-blue;
						}
					}
				}
			}
			a {
				margin: 0;
			}

			@media (max-width: 568px) {
				padding: 10px;
			}
		}

		input {
			width: 42%;
			padding: 8px;
			margin: 0;
			font-size: 20px;
			&::placeholder {
				font-size: 20px;
				color: $black;
			}

			@media (max-width: 1024px) {
				display: none;
			}
		}

		button,
		.btn {
			transition: all 0.4s !important;
		}

		.btn {
			text-decoration: none;
		}

		.hero {
			display: flex;
			align-items: center;
			justify-content: center;
			max-width: 1600px;
			margin: 0 auto;
			padding-top: 150px;

			.text {
				width: 50%;

				h1 {
					font-weight: 700;
				}
				p {
					font-size: 20px;
					margin: 10px 0 50px;
					max-width: 600px;
				}
			}

			form {
				display: flex;
				align-items: center;
				justify-content: flex-start;
				width: 100%;

				button {
					background: $blue;
					color: white;
					font-size: 20px;
					padding: 8px 30px;
					margin: 0;
					margin-left: 15px;

					&:hover {
						background: $dark-blue;
					}
				}
			}
			img {
				width: 27.5%;
				margin-left: 50px;
			}
			@media (max-width: 1024px) {
				.text {
					width: 80%;

					p {
						max-width: none;
					}
				}
				img {
					display: none;
				}

				form {
					button {
						width: 100%;
						margin: 0;
					}
				}
			}
		}

		.product {
			margin: 100px 30px 0;

			h2,
			p {
				text-align: center;
			}

			p {
				max-width: 900px;
				margin: auto;
				font-size: 1.25rem;
			}

			.btn {
				border: 1px solid $blue;
				background-color: white;
				color: $blue;
				margin: 30px auto;
				display: block;
				font-size: 20px;
				padding: 10px 20px;
				font-weight: 600;

				&:hover {
					background-color: $blue;
					color: white;
				}
			}
		}

		.signup {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin: 100px auto 0;
			width: 75%;
			background: #eae6ff;
			background-image: url(https://d2k1ftgv7pobq7.cloudfront.net/meta/p/res/images/spirit/sign-up/95ae6a1535b6504e3572dc7393a2d482/background.svg),
				linear-gradient(0deg, #4c9aff, #403294 100%);
			background-position: center top;
			background-repeat: no-repeat;
			background-size: cover;

			border-radius: 8px;
			padding: 50px 20px;

			h3 {
				text-align: center;
				color: white;
				max-width: 800px;
				margin: auto auto 30px;
			}

			form {
				display: flex;
				align-items: center;
			}
			input {
				width: 275px;
			}

			button {
				background-color: $blue;
				color: white;
				font-size: 20px;
				padding: 8px 40px;
				margin-left: 20px;

				&:hover {
					background-color: $dark-blue;
				}
			}

			@media (max-width: 1024px) {
				width: 95%;
			}
		}

		.features {
			margin: 100px auto;
			display: flex;
			flex-direction: column;
			padding: 0 10vw;
			max-width: 1600px;

			> div {
				margin-bottom: 50px;
			}

			.description {
				max-width: 500px;
				margin-bottom: 100px;
				p {
					font-size: 1.35rem;
				}
			}

			.feature {
				display: flex;
				flex-direction: row-reverse;
				justify-content: space-between;

				> div {
					width: 50%;
				}

				.text {
					p {
						color: #7a869a;
						font-size: 20px;
					}
				}

				.img-container {
					width: 40%;
					img {
						width: 100%;
					}
				}

				.learn-more {
					cursor: pointer;

					&:hover span:last-child {
						text-decoration: underline;
					}
				}

				.learn-more-content {
					padding-left: 17px;

					p,
					li {
						color: $black;
						font-size: 18px;
						opacity: 1;
						transition: opacity 0.3s ease-in-out;
					}

					ul {
						li {
							margin-bottom: 5px;
						}
					}
				}
			}

			.feature:last-child {
				flex-direction: row;
			}

			@media (max-width: 1024px) {
				.feature {
					flex-direction: column-reverse !important;

					.text {
						width: 100%;

						h3,
						h2 {
							margin: 0;
						}
					}

					.img-container {
						width: 60%;
						min-width: 450px;
						margin: 40px auto;
					}
				}
			}

			@media (max-width: 568px) {
				.feature {
					.img-container {
						width: 80%;
						min-width: 300px;
					}
				}
			}
		}
	}
</style>
