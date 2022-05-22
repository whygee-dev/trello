import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	id: number;
	title: string;
	type: string;
	description: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 200, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		const validateTitle = Validators.validateTitle(json.title);
		const validateType = Validators.validateWorkSpaceType(json.type);

		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 401,
				body: {
					errors: ['Invalid workspace id']
				}
			};
		}

		if (!validateTitle.pass || !validateType.pass) {
			return {
				status: 401,
				body: {
					errors: [validateTitle.message, validateType.message]
				}
			};
		}
		const workspace = await prisma.workSpace.update({
			where: { id: json.id },
			data: {
				title: json.title,
				type: json.type,
				description: json.description || ''
			}
		});

		return {
			status: 200,
			body: workspace || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
