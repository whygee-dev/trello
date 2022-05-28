import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	id: number;
	title: string;
	description: string;
	date: Date;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		/* if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		} */

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid board ID'] }
			};
		} else if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const column = await prisma.column.findUnique({ where: { id: json.id } });

		if (column) {
			const cards = await prisma.card.findMany({
				where: { columnId: json.id },
				orderBy: { xIndex: 'desc' }
			});
			const xIndex = (cards.length > 0) ? ++cards[0].xIndex : 0;
			const card = await prisma.card.create({
				data: {
					title: json.title,
					description: json.description,
					date: json.date,
					xIndex: xIndex,
					column: { connect: { id: column?.id } }
				}
			});

			return {
				status: 201,
				body: card || {}
			};
		} else {
			return {
				status: 400,
				body: { errors: ['Undefined column'] }
			};
		}
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
