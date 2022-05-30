import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	labelId: string;
	cardId: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.labelId || typeof json.labelId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid label ID'] }
			};
		} else if (!json.cardId || typeof json.cardId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid card ID'] }
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

		const label = await prisma.label.findFirst({
			where: {
				id: json.labelId,
				board: {
					workSpace: {
						users: {
							some: { id: locals.user.id }
						}
					}
				}
			}
		});

		if (!label || !card) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const updatedLabel = await prisma.label.update({
			where: { id: json.labelId },
			data: { cards: { connect: { id: card?.id } } }
		});

		return {
			status: 200,
			body: updatedLabel || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
