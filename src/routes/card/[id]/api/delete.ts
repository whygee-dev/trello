import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const del: RequestHandler = async ({ request, locals, params }) => {
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
		const card = await prisma.card.findUnique({ where: { id: id } });

		if (!card) {
			return {
				status: 400,
				body: { errors: ['Undefined card'] }
			};
		}

		const deletedCard = await prisma.card.delete({ where: { id: id } });

		return {
			status: 200,
			body: deletedCard || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
