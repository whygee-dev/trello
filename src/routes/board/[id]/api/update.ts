import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = {
	id: number;
	title: string;
	description: string;
	image: string;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
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
				status: 401,
				body: ['Unauthorized operation']
			};
		}


		if (workSpace) {
			const board = await prisma.board.update({
				where: { id: params.id },
				data: {
					title: json.title,
					description: json.description,
					image: json.image
				}
			});

			return {
				status: 200,
				body: board || []
			};
		}

		return {
			status: 400,
			body: ['Undefined Board']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
