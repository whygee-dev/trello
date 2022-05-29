import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = {
	title: string;
	color: string;
};

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

		if (!json.title) {
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

		const board = await prisma.board.findUnique({ where: { id: id } });

		if (!board) {
			return {
				status: 400,
				body: { errors: ['Undefined board'] }
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
