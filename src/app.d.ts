/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

type User = {
	email: string;
	fullname: string;
};
declare namespace App {
	interface Locals {
		user: User;
	}

	// interface Platform {}

	// interface Session {}

	// interface Stuff {}
}
