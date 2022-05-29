import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	title: string;
	description: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
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

		const user = await prisma.user.findUnique({ where: { email: locals.user.email } });

		if (user) {
			const workSpace = await prisma.workSpace.create({
				data: {
					title: json.title,
					description: json.description,
					users: { connect: { id: user.id } },
					ownerId: user.id
				}
			});

			return {
				status: 201,
				body: workSpace || []
			};
		}

		return {
			status: 400,
			body: { errors: ['An unexpected error occured'] }
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
