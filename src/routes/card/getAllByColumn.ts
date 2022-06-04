import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { columnId: string };

export const get: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.columnId || typeof json.columnId !== 'string') {
			return {
				status: 400,
				body: { error: ['Invalid column ID'] }
			};
		}

		const column = await prisma.column.findFirst({
			where: {
				id: json.columnId,
				board: {
					workSpace: {
						users: {
							some: { id: locals.user.id }
						}
					}
				}
			}
		});

		if (!column) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const cards = await prisma.card.findMany({
			where: { columnId: json.columnId },
			orderBy: { index: 'asc' }
		});

		return {
			status: 200,
			body: cards || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
