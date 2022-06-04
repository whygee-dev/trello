import type { Card } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	sourceColumnId: string;
	targetColumnId: string;
	cards: Card[];
	sourceCards?: Card[];
	boardId: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (
			!json.sourceColumnId ||
			!json.targetColumnId ||
			!json.boardId ||
			typeof json.sourceColumnId !== 'string' ||
			typeof json.targetColumnId !== 'string' ||
			typeof json.boardId !== 'string'
		) {
			return {
				status: 400,
				body: { errors: ['Invalid body'] }
			};
		}

		const boardCondition = {
			id: json.boardId,
			workSpace: {
				users: {
					some: { id: locals.user.id }
				}
			}
		};

		const [sourceColumn, targetColumn] = await Promise.all([
			prisma.column.findFirst({
				where: { id: json.sourceColumnId, board: boardCondition },
				include: { cards: true }
			}),
			prisma.column.findFirst({
				where: { id: json.targetColumnId, board: boardCondition },
				include: { cards: true }
			})
		]);

		if (!sourceColumn || !targetColumn) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		if (!json.cards) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const [cards, sourceCards] = await Promise.all([
			prisma.card.findMany({
				where: {
					id: { in: json.cards.map((c) => c.id) },
					column: {
						board: boardCondition,
						id: { in: [json.targetColumnId, json.sourceColumnId] }
					}
				}
			}),

			json.sourceCards
				? prisma.card.findMany({
						where: {
							id: { in: json.sourceCards.map((c) => c.id) },
							column: {
								board: boardCondition,
								id: { in: [json.targetColumnId, json.sourceColumnId] }
							}
						}
				  })
				: null
		]);

		if (
			cards.length !== json.cards.length ||
			(json.sourceCards && sourceCards && sourceCards.length !== json.sourceCards.length)
		) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		if (targetColumn.id !== sourceColumn.id) {
			await Promise.all([
				Promise.all(
					json.cards.map(async (c, index) => {
						return prisma.card.update({
							where: { id: c.id },
							data: { index, column: { connect: { id: targetColumn.id } } }
						});
					})
				),

				sourceCards && json.sourceCards
					? Promise.all(
							json.sourceCards.map(async (c, index) => {
								return prisma.card.update({
									where: { id: c.id },
									data: { index, column: { connect: { id: sourceColumn.id } } }
								});
							})
					  )
					: null
			]);
		} else {
			await Promise.all(
				json.cards.map(async (c, index) => {
					return prisma.card.update({ where: { id: c.id }, data: { index } });
				})
			);
		}

		return {
			status: 200,
			body: { message: 'OK' }
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
