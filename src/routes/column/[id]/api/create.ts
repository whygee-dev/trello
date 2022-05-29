import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = { title: string };

export const post: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const board = await prisma.board.findUnique({ where: { id: id } });

		if (board) {
			const columns = await prisma.column.findMany({
				where: { boardId: id },
				orderBy: { yIndex: 'desc' }
			});
			const yIndex = columns.length > 0 ? ++columns[0].yIndex : 0;
			const column = await prisma.column.create({
				data: {
					title: json.title,
					yIndex: yIndex,
					board: { connect: { id: board.id } }
				}
			});

			return {
				status: 201,
				body: column || {}
			};
		}

		return {
			status: 400,
			body: { errors: ['Undefined board'] }
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
