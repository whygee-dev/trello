import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const board = await prisma.board.findUnique({ where: { id: id } });

		if (board) {
			const columns = await prisma.column.findMany({ where: { boardId: id } });

			return {
				status: 200,
				body: columns || []
			};
		} else {
			return {
				status: 200,
				body: { errors: ['Undefined board'] }
			};
		}
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
