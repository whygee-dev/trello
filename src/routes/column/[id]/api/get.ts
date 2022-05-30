import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';

export const get: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id;
		const column =  await prisma.column.findFirst({
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

		if (!column) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		return {
			status: 200,
			body: column || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
