import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const board = await prisma.board.findUnique({
			where: { id: params.id },
			include: {
				columns: { include: { cards: { include: { labels: true } } } },
				workSpace: { include: { users: true } }
			}
		});

		if (!board) {
			return { status: 400, body: { message: 'Forbidden' } };
		}

		const workSpace = board.workSpace;

		const member = workSpace.users.find((u) => u.id === locals.user?.id);

		if (!member) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		return {
			status: 200,
			body: board || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
