import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { cardId: string; };

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.cardId || typeof json.cardId !== 'string') {
			return {
				status: 400,
				body: { error: ['Invalid card ID'] }
			};
		}

		const card = await prisma.card.findFirst({
			where: {
				id: json.cardId,
				column: {
					board: {
						workSpace: {
							users: {
								some: { id: locals.user.id }
							}
						}
					}
				}
			}
		});

		if (!card) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const labels = await prisma.label.findMany({
			where: { cardId: json.cardId }
		});

		return {
			status: 200,
			body: labels || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
