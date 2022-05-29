/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

type User = {
	id: string;
	email: string;
	fullname: string;
} | null;
declare namespace App {
	interface Locals {
		user: User;
	}

	// interface Platform {}

	interface Session {
		user: User;
	}

	// interface Stuff {}
}
