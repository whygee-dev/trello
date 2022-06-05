import * as cookie from 'cookie';
import type { GetSession, Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const handle: Handle = async ({ event, resolve }) => {
	if (process.env.JWT_SECRET) {
		try {
			const cookies = cookie.parse(event.request.headers.get('cookie') || '');
			const token = cookies.jwt;

			event.locals.user = token ? (jwt.verify(token, process.env.JWT_SECRET) as User) : null;
		} catch (error) {
			console.log('hooks', error);
		}
	}

	return await resolve(event);
};

export const getSession: GetSession = async ({ locals }) => {
	return {
		user: locals.user && {
			email: locals.user.email,
			fullname: locals.user.fullname,
			id: locals.user.id
		}
	};
};
