import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';
import { Validators } from './../../../utils/validators';

type Body = {
	email: string;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		const validateEmail = Validators.validateEmail(json.email);

		if (!validateEmail.pass) {
			return {
				status: 401,
				body: {
					errors: [validateEmail.message]
				}
			};
		}

		const userToAdd = await prisma.user.findUnique({ where: { email: json.email } });
		const workSpace = await prisma.workSpace.findUnique({ where: { id: params.id } });

		if (!workSpace) {
			return {
				status: 401,
				body: ['Undefined WorkSpace']
			};
		}

		if (userToAdd && workSpace.ownerId === locals.user.id) {
			if (userToAdd.id === locals.user.id) {
				return {
					status: 400,
					body: { errors: ['You cannot add yourself to the workspace'] }
				};
			}

			await prisma.workSpace.update({
				where: { id: workSpace.id },
				data: { users: { connect: { id: userToAdd.id } } }
			});

			return {
				status: 200,
				body: workSpace || {}
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
