import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = {
	id: number;
	title: string;
	description: string;
	image: string;
};

export const post: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!id || typeof id !== 'number') {
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

		const workSpace = await prisma.workSpace.findUnique({ where: { id } });
		const user = await prisma.user.findUnique({ where: { email: locals.user.email } });

		if (workSpace && user && workSpace.ownerId === user.id) {
			const board = await prisma.board.create({
				data: {
					title: json.title,
					image: json.image,
					description: json.description,
					workSpace: { connect: { id: workSpace?.id } }
				}
			});

			return {
				status: 201,
				body: board || []
			};
		}

		return {
			status: 401,
			body: { errors: ['Unauthorised operation'] }
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
