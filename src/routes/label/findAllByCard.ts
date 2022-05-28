import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { id: number };

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid card ID'] }
			};
		}

		const labels = await prisma.label.findMany({
			where: { cards: { some: { id: json.id } } }
		});
		return {
			status: 200,
			body: labels || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
