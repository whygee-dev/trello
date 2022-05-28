import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { id: number };

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid workspace ID'] }
			};
		}

		const boards = await prisma.board.findMany({ where: { workSpaceId: json.id } });

		if (boards) {
			return {
				status: 200,
				body: boards || []
			};
		}

		return {
			status: 401,
			body: ['Workspace not found']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
