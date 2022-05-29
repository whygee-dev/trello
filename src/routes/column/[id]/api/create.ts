import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = { title: string };

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

		if (!board) {
			return {
				status: 400,
				body: { errors: ['Undefined board'] }
			};
		}
		
		const columns = await prisma.column.findMany({
			where: { boardId: id },
			orderBy: { yIndex: 'desc' }
		});
		const yIndex = (columns.length > 0) ? ++columns[0].yIndex : 0;
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
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
