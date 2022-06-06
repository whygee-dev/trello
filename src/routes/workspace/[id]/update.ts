import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';
import { Validators } from '../../../utils/validators';

type Body = {
	title: string;
	description: string;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		const validateDescription = json.description
			? Validators.validateDescription(json.description)
			: null;

		if (validateDescription && !validateDescription.pass) {
			return {
				status: 400,
				body: {
					errors: [validateTitle.message, validateDescription.message]
				}
			};
		}

		if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const workSpace = await prisma.workSpace.findUnique({ where: { id: params.id } });

		if (!workSpace) {
			return {
				status: 401,
				body: ['Undefined WorkSpace']
			};
		}

		if (workSpace && locals.user.id === workSpace.ownerId) {
			const updatedWorkSpace = await prisma.workSpace.update({
				where: { id: params.id },
				data: {
					title: json.title,
					description: json.description
				}
			});

			return {
				status: 200,
				body: updatedWorkSpace || {}
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
