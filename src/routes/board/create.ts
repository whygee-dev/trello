import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	title: string;
	description: string;
	image: string;
};

export const post: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const workSpace = await prisma.workSpace.findFirst({
			where: { users: { some: { id: locals.user.id } } },
			include: { users: true }
		});

		if (!workSpace) {
			return {
				status: 400,
				body: ['Unauthorized operation']
			};
		}

		if (workSpace) {
			const board = await prisma.board.create({
				data: {
					title: json.title,
					image: json.image,
					description: json.description,
					workSpace: { connect: { id: workSpace.id } }
				}
			});

			return {
				status: 201,
				body: board || {}
			};
		}

		return {
			status: 401,
			body: ['Undefined workspace']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
