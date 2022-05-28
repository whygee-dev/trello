import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { id: number };

export const del: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid workspace ID'] }
			};
		}

		const workSpace = await prisma.workSpace.findUnique({ where: { id: json.id } });
		const user = await prisma.user.findUnique({ where: { email: locals.user.email } });

		if (workSpace && user && user.id === workSpace.ownerId) {
			await prisma.workSpace.delete({ where: { id: workSpace.id } });

			return {
				status: 200,
				body: workSpace || {}
			};
		}

		return {
			status: 400,
			body: ['Unauthorized operation']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
