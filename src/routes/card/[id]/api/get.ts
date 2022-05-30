import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
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

		return {
			status: 200,
			body: card || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
