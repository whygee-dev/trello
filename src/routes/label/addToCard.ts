import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	labelId: number;
	cardId: number;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		if (!json.labelId || typeof json.labelId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid label ID'] }
			};
		} else if (!json.cardId || typeof json.cardId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid card ID'] }
			};
		}

		const card = await prisma.card.findUnique({ where: { id: json.cardId } });
		if (card) {
			const label = await prisma.label.update({
				where: { id: json.labelId },
				data: { cards: { connect: { id: card?.id } } }
			});
			return {
				status: 201,
				body: label || {}
			};
		} else {
			return {
				status: 400,
				body: { errors: ['Undefined card'] }
			};
		}
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
