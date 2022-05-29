import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
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

		const id = params.id;
		const column = await prisma.column.findUnique({ where: { id: id } });

		if (!column) {
			return {
				status: 400,
				body: { errors: ['Undefined column'] }
			};
		}

		const cards = await prisma.card.findMany({
			where: { columnId: id },
			orderBy: { xIndex: 'asc' }
		});

		return {
			status: 200,
			body: cards || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
