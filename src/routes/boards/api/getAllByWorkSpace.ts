import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
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

		if (workSpace) {
			const boards = await prisma.board.findMany({ where: { workSpaceId: workSpace.id } });

			if (boards) {
				return {
					status: 200,
					body: boards || []
				};
			}
		}

		return {
			status: 401,
			body: ['Workspace not found']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
