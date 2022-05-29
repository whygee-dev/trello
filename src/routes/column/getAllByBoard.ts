import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { boardId: string; };

export const post: RequestHandler = async ({ request, locals, params }) => {
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

		const json: Body = await request.json();

		if (!json.boardId || typeof json.boardId !== 'string') {
			return {
				status: 400,
				body: { error: ['Invalid board ID'] }
			};
		}

		const board = await prisma.board.findUnique({
			where: { id: json.boardId }
		});

		if (!board) {
			return {
				status: 200,
				body: { errors: ['Undefined board'] }
			};
		}

		const columns = await prisma.column.findMany({
			where: { boardId: json.boardId },
			include: {
				cards: {
					include: {
						labels: true
					}
				}
			}
		});

		return {
			status: 200,
			body: columns || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
