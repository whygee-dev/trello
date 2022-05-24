import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	id: number;
	title: string;
	type: string;
	description: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) { return { status: 401, body: { message: 'Unauthorized' } }; }

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		const validateType = Validators.validateWorkSpaceType(json.type);
		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid workspace ID'] }
			};
		} else if (!validateTitle.pass || !validateType.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message, validateType.message] }
			};
		}

		const workSpace = await prisma.workSpace.update({
			where: { id: json.id },
			data: {
				title: json?.title,
				type: json.type,
				description: json.description
			}
		});

		return {
			status: 200,
			body: workSpace || {}
		};
	} catch (error) { return { status: 500, body: { message: 'Server error occured' } }; }
};
