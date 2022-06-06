import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = {
	title: string;
	description: string;
	date: Date;
	cover: string;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		const validateCover = Validators.validateImage(json.cover?.split(',')[1]);

		if (!validateTitle.pass || !validateCover.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message, validateCover.message] }
			};
		}

		const card =  await prisma.card.findFirst({
			where: {
				id: id,
				column: {
					board: {
						workSpace: {
							users: {
								some: { id: locals.user.id }
							}
						}
					}
				}
			},
		});

		if (!card) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const updatedCard = await prisma.card.update({
			where: { id: id },
			data: {
				title: json.title,
				description: json.description,
				date: json.date,
				cover: json.cover ?? card.cover
			}
		});

		return {
			status: 200,
			body: updatedCard || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
