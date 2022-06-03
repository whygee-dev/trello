import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	columnId: string;
	title: string;
	description: string;
	date: Date;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!json.columnId || typeof json.columnId !== 'string') {
			return {
				status: 400,
				body: { error: ['Invalid column ID'] }
			};
		} else if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const column = await prisma.column.findFirst({
			where: {
				id: json.columnId,
				board: {
					workSpace: {
						users: {
							some: { id: locals.user.id }
						}
					}
				}
			}
		});

		if (!column) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const cards = await prisma.card.findMany({
			where: { columnId: json.columnId },
			orderBy: { index: 'desc' }
		});
		const index = cards.length > 0 ? ++cards[0].index : 0;
		const card = await prisma.card.create({
			data: {
				title: json.title,
				description: json.description,
				date: json.date,
				index,
				column: { connect: { id: column?.id } }
			}
		});

		return {
			status: 201,
			body: card || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
