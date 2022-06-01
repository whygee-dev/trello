import type { RequestHandler } from '@sveltejs/kit';
import { unlink, unlinkSync } from 'fs';
import { prisma } from '../../../../db';

export const del: RequestHandler = async ({ request, locals, params }) => {
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

		if (!workSpace || workSpace.ownerId !== locals.user.id) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		if (board.image) {
			unlinkSync(`static/board-${board.id}.png`);
		}

		await prisma.board.delete({ where: { id: board.id } });

		return {
			status: 200,
			body: board || []
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
