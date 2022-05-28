import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { id: number };

export const del: RequestHandler = async ({ request, locals }) => {
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
		const board = await prisma.board.findUnique({ where: { id: json.id } });

		if (board) {
			const workSpaceId = board.workSpaceId;
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
			body: ['Unauthorised operation']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
