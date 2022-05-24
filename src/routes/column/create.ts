import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	id: number;
	title: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) { return { status: 401, body: { message: 'Unauthorized' } }; }

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid board ID'] }
			};
		} else if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const board = await prisma.board.findUnique({ where: { id: json.id } });
		if (board) {
			const column = await prisma.column.create({
				data: {
					title: json.title,
					board: { connect: { id: board.id } }
				}
			});
			return {
				status: 201,
				body: column || {}
			};
		} else {
			return {
				status: 400,
				body: { errors: ['Undefined board'] }
			};
		}
	} catch (error) { return { status: 500, body: { message: 'Server error occured' } }; }
};
