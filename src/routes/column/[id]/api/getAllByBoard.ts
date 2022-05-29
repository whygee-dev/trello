import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workSpace = await prisma.workSpace.findFirst({
			where: { users: { some: { id: locals.user.id } } },
			include: { users: true }
		});

		if (!workSpace?.users[0]) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const id = params.id;
		const board = await prisma.board.findUnique({ where: { id: id } });

		if (!board) {
			return {
				status: 200,
				body: { errors: ['Undefined board'] }
			};
		}

		const columns = await prisma.column.findMany({ where: { boardId: id } });

		return {
			status: 200,
			body: columns || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
