import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const user = await prisma.user.findUnique({ where: { id: locals.user.id } });

		if (!user) {
			return {
				status: 404,
				body: { errors: ['User not found'] }
			};
		}

		return {
			status: 200,
			body: user
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
