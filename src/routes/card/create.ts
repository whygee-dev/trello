import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	columnId: string;
	title: string;
	description: string;
	date: Date;
};

export const post: RequestHandler = async ({ request, locals, params }) => {
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

		const column = await prisma.column.findUnique({ where: { id: json.columnId } });

		if (!column) {
			return {
				status: 400,
				body: { errors: ['Undefined column'] }
			};
		}

		const cards = await prisma.card.findMany({
			where: { columnId: json.columnId },
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
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
