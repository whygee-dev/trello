import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	draggedCardId: string;
	switchedCardId: string
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
        if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.draggedCardId
            || !json.switchedCardId
            || typeof json.draggedCardId !== 'string'
            || typeof json.switchedCardId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid card ID'] }
			};
		}

		const draggedCard = await prisma.card.findFirst({
			where: {
				id: json.draggedCardId,
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

		const switchedCard = await prisma.card.findFirst({
			where: {
				id: json.switchedCardId,
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

		if (!draggedCard || !switchedCard) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const updatedCurrentCard = await prisma.card.update({
			where: { id: json.draggedCardId },
			data: { xIndex: switchedCard?.xIndex }
		});
		const updatedSwitchedCard = await prisma.card.update({
			where: { id: json.switchedCardId },
			data: { xIndex: draggedCard?.xIndex }
		});

		return {
			status: 200,
			body: [updatedCurrentCard, updatedSwitchedCard] || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
