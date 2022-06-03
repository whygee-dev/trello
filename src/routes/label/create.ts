import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	cardId: string;
	title: string;
	color: string;
};

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
		} else if (!json.title) {
			return {
				status: 400,
				body: { errors: ['Undefined title parameter'] }
			};
		} else if (!json.color || typeof json.color !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid color parameter'] }
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

		const label = await prisma.label.create({
			data: {
				title: json.title,
				color: json.color,
				card: { connect: { id: card.id } }
			}
		});

		return {
			status: 201,
			body: label || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
