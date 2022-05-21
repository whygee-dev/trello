import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

export const get: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 200, body: { message: 'Unauthorized' } };
		}

		const user = await prisma.user.findUnique({
			where: { email: locals.user.email },
			include: {
				boards: true
			}
		});

		const boards = user?.boards;

		return {
			status: 200,
			body: boards || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
