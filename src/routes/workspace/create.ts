import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
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

		if (!validateTitle.pass || !validateType.pass) {
			return {
				status: 401,
				body: {
					errors: [validateTitle.message, validateType.message]
				}
			};
		}

		const user = await prisma.user.findUnique({ where: { email: locals.user?.email } });
		const workspace = await prisma.workSpace.create({
			data: {
				title: json.title,
				type: json.type,
				description: json.description || '',
				users: {
					connect: {
						id: user?.id
					}
				}
			}
		});

		return {
			status: 200,
			body: workspace || []
		};
	} catch (error) {
		console.log(error);
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
