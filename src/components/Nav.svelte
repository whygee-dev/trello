<nav>
    <section class="container">
        <div class="start-navbar">
            <a href="/"><img src="logo.svg" alt="App logo" width="136" height="36"></a>
        </div>

        <div class="end-navbar">
            <a href="/login">Log in</a>
            <button class="btn" type="submit">Sign up</button>
        </div>
    </section>
</nav>

<style lang="scss">
    img {
        margin: 1rem;
    }

    .container {
        display: flex;
		position: fixed;
        background-color: transparent;
        width: 100%;
	}

    .end-navbar {
        display: flex;
        justify-content: flex-end;
        justify-content: space-between;
    }

    .btn {
        background-color: #0065ff;
        color: white;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-size: 1rem;
        font-weight: 500;
        transition: all .2s;
		&:hover {
			background-color: #0454dc;
		}
    }
</style>
