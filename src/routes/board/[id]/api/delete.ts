import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const del: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workSpace = await prisma.workSpace.findFirst({
			where: { users: { some: { id: locals.user.id } } },
			include: { users: true }
		});

		if (!workSpace) {
			return {
				status: 401,
				body: ['Unauthorized operation']
			};
		}

		if (workSpace && workSpace.ownerId === locals.user.id) {
			const board = await prisma.board.findUnique({ where: { id: params.id } });

			if (board) {
				await prisma.board.delete({ where: { id: board.id } });

				return {
					status: 200,
					body: board || []
				};
			}
		}

		return {
			status: 401,
			body: ['Undefined Board']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
