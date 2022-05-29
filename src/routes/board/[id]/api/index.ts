import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;

		const board = await prisma.board.findUnique({
			where: { id },
			include: {
				columns: { include: { cards: { include: { labels: true } } } },
				workSpace: { include: { users: true } }
			}
		});

		if (board) {
			return {
				status: 200,
				body: board || []
			};
		}

		return {
			status: 400,
			body: ['Board not found']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
