import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	boardId: string;
	title: string;
	color: string;
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
		} else if (!json.title) {
			return {
				status: 400,
				body: { errors: ['Undefined title parameter'] }
			};
		} else if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		} else if (!json.color) {
			return {
				status: 400,
				body: { errors: ['Undefined color parameter'] }
			};
		} else if (typeof json.color !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid color type parameter'] }
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

		const label = await prisma.label.create({
			data: {
				title: json.title,
				color: json.color,
				board: { connect: { id: board.id } }
			}
		});

		return {
			status: 201,
			body: label || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
