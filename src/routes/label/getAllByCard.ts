import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { cardId: string; };

export const get: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workSpace = await prisma.workSpace.findFirst({
			where: { users: { some: { id: locals.user.id } } },
			include: { users: true }
		});

		if (!workSpace?.users[0]) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const json: Body = await request.json();

		if (!json.cardId || typeof json.cardId !== 'string') {
			return {
				status: 400,
				body: { error: ['Invalid card ID'] }
			};
		}

		const card = await prisma.card.findUnique({ where: { id: json.cardId } });

		if (!card) {
			return {
				status: 400,
				body: { errors: ['Undefined card'] }
			};
		}

		const labels = await prisma.label.findMany({
			where: { cards: { some: { id: json.cardId } } }
		});

		return {
			status: 200,
			body: labels || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
