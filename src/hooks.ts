import * as cookie from 'cookie';
import type { GetSession, Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import type { User } from '@prisma/client';

export const handle: Handle = async ({ event, resolve }) => {
	if (process.env.JWT_SECRET) {
		try {
			const cookies = cookie.parse(event.request.headers.get('cookie') || '');
			const token = cookies.jwt;

			if (token) {
				const payload = jwt.verify(token, process.env.JWT_SECRET);
				event.locals.user = payload as User;

				if (event.locals.user!.id) {
					const user = await prisma.user.findUnique({ where: { id: event.locals.user!.id } });

					event.locals.user.image = user?.image;
				}
			} else {
				event.locals.user = null;
			}
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
			id: locals.user.id,
			image: locals.user.image ?? ''
		}
	};
};
