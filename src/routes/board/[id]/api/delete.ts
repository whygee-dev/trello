import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const del: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;

		if (!id || typeof id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid board ID'] }
			};
		}

		const board = await prisma.board.findUnique({ where: { id } });

		if (board) {
			const workSpace = await prisma.workSpace.findUnique({ where: { id } });
			const user = await prisma.user.findUnique({ where: { email: locals.user.email } });

			if (workSpaceId && user && workSpaceId === user.id) {
				await prisma.board.delete({ where: { id: board.id } });

				return {
					status: 200,
					body: board || []
				};
			}
		}

		return {
			status: 401,
			body: ['Unauthorized operation']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
