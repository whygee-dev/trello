import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	id: number;
	title: string;
	description: string;
	image: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

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

		const user = await prisma.user.findUnique({ where: { email: locals.user.email } });
		const workSpace = await prisma.workSpace.findUnique({ where: { id: json.id } });

		if (user && workSpace && user.id === workSpace.ownerId) {
			const board = await prisma.board.update({
				where: { id: workSpace.id },
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
			body: ['Unauthorized operation']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
