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
				body: { errors: ['Invalid board ID'] }
			};
		}

		const columns = await prisma.column.findMany({ where: { boardId: json.id } });

		return {
			status: 200,
			body: columns || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
