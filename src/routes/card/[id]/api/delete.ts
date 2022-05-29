import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const del: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const card = await prisma.card.findUnique({ where: { id: id } });

		if (card) {
			const deletedCard = await prisma.card.delete({ where: { id: id } });

			return {
				status: 200,
				body: deletedCard || {}
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
