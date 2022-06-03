import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	boardId: string;
	title: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!json.boardId || typeof json.boardId !== 'string') {
			return {
				status: 400,
				body: { error: ['Invalid board ID'] }
			};
		} else if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const board = await prisma.board.findFirst({
			where: {
				id: json.boardId,
				workSpace: {
					users: {
						some: { id: locals.user.id }
					}
				}
			}
		});

		if (!board) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const columns = await prisma.column.findMany({
			where: { boardId: json.boardId },
			orderBy: { index: 'desc' }
		});
		const index = columns.length > 0 ? ++columns[0].index : 0;
		const column = await prisma.column.create({
			data: {
				title: json.title,
				index,
				board: { connect: { id: board.id } }
			}
		});

		return {
			status: 201,
			body: column || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
