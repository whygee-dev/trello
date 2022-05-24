import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = { id: number; };

export const del: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) { return { status: 401, body: { message: 'Unauthorized' } }; }

		const json: Body = await request.json();
		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid label ID'] }
			};
		}

		const label = await prisma.label.delete({ where: { id: json.id } });
		return {
			status: 200,
			body: label || {}
		};
	} catch (error) { return { status: 500, body: { message: 'Server error occured' } }; }
};
