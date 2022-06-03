import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const del: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const label =  await prisma.label.findFirst({
			where: {
				id: id,
				board: {
					workSpace: {
						users: {
							some: { id: locals.user.id }
						}
					}
				}
			},
		});

		if (!label) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const deletedLabel = await prisma.label.delete({ where: { id: id } });

		return {
			status: 200,
			body: deletedLabel || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};