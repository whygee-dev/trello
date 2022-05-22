import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	id: number;
	title: string;
	description: string;
	image: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 200, body: { message: 'Unauthorized' } };
		}
		const json: Body = await request.json();

		const validateTitle = Validators.validateTitle(json.title);

		if (!validateTitle.pass) {
			return {
				status: 401,
				body: {
					errors: [validateTitle.message]
				}
			};
		}

		const workspace = await prisma.workSpace.findUnique({ where: { id: json.id } });
		const board = await prisma.board.create({
			data: {
				title: json.title,
				image: json.image || '',
				description: json.description || '',
				workSpace: {
					connect: { id: workspace?.id }
				}
			}
		});

		return {
			status: 200,
			body: board || []
		};
	} catch (error) {
		console.log(error);
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
