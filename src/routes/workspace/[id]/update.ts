import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';
import { Validators } from '../../../utils/validators';

type Body = {
	title: string;
	type: string;
	description: string;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		const validateType = Validators.validateWorkSpaceType(json.type);
		const workspaceId = params.id;

		if (!validateTitle.pass || !validateType.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message, validateType.message] }
			};
		}

		const user = await prisma.user.findUnique({ where: { email: locals.user.email } });
		const workSpace = await prisma.workSpace.findUnique({ where: { id: workspaceId } });

		if (user && workSpace && user.id === workSpace.ownerId) {
			const updatedWorkSpace = await prisma.workSpace.update({
				where: { id: workspaceId },
				data: {
					title: json?.title,
					type: json.type,
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
