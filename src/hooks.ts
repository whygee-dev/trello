import * as cookie from 'cookie';
import type { GetSession, Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	const jwt = cookies.jwt && Buffer.from(cookies.jwt, 'base64').toString('utf-8');
	event.locals.user = jwt ? JSON.parse(jwt) : null;

	return await resolve(event);
};

export const getSession: GetSession = async ({ locals }) => {
	return {
		user: locals.user && {
			email: locals.user.email,
			fullname: locals.user.fullname
		}
	};
};
