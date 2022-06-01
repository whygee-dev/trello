import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	cardId: string;
	userId: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.cardId || typeof json.cardId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid card ID'] }
			};
		} else if (!json.userId || typeof json.userId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid user ID'] }
			};
		}

		const card =  await prisma.card.findFirst({
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
			},
			select: {
				column: {
					select: {
						board: {
							include: {
								workSpace: true
							}
						}
					}
				}
			}
		});

		const user = await prisma.user.findFirst({
			where: {
				id: json.userId,
				workSpaces: {
					some: {
						id: card?.column.board.workSpaceId
					}
				}
			}
		});

		if (!card || !user) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const updatedCard = await prisma.card.update({
			where: { id: json.cardId },
			include: { users: true },
			data: { users: { disconnect: { id: user?.id } } }
		});

		return {
			status: 200,
			body: updatedCard || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
