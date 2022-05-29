import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const del: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const label = await prisma.label.findUnique({ where: { id: id } });

		if (label) {
			const deletedLabel = await prisma.label.delete({ where: { id: id } });

			return {
				status: 200,
				body: deletedLabel || {}
			};
		} else {
			return {
				status: 400,
				body: { errors: ['Undefined label'] }
			};
		}
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
