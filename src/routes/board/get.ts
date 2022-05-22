import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	id: number;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 200, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 401,
				body: {
					errors: ['Invalid board id']
				}
			};
		}
		const board = await prisma.board.findUnique({ where: { id: json.id } });

		return {
			status: 200,
			body: board || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
