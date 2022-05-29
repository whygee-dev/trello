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

		if (!json.draggedCardId
            || !json.switchedCardId
            || typeof json.draggedCardId !== 'string'
            || typeof json.switchedCardId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid card ID'] }
			};
		}

		const draggedCard = await prisma.card.findUnique({ where: { id: json.draggedCardId } });
        const switchedCard = await prisma.card.findUnique({ where: { id: json.switchedCardId } });

		if (!draggedCard || !switchedCard) {
			return {
				status: 400,
				body: { errors: ['One or Both cards are undefined'] }
			}
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
