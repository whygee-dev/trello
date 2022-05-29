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

		const card = await prisma.card.findUnique({ where: { id: json.cardId } });
		const label = await prisma.label.findUnique({ where: { id: json.labelId } });

		if (!label || !card) {
			return {
				status: 400,
				body: { errors: ['Undefined label or card'] }
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
