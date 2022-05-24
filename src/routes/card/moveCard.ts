import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	cardId: number;
	columnId: number;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		//if (!locals.user) { return { status: 401, body: { message: 'Unauthorized' } }; }

		const json: Body = await request.json();
		if (!json.cardId || typeof json.cardId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid card ID'] }
			};
		} else if (!json.columnId || typeof json.columnId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid column ID'] }
			};
		}

		const column = await prisma.column.findUnique({ where: { id: json.columnId } });
        if (column) {
            const card = await prisma.card.update({
                where: { id: json.cardId },
                data: { column: { connect: { id: column.id } } }
            });
            return {
                status: 200,
                body: card || {}
            };
        } else {
			return {
				status: 400,
				body: { errors: ['Undefined column'] }
			};
		}
	} catch (error) { return { status: 500, body: { message: 'Server error occured' } }; }
};
