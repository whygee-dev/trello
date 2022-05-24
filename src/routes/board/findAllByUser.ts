import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

export const post: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user) { return { status: 401, body: { message: 'Unauthorized' } }; }

		const user = await prisma.user.findUnique({
			where: { email: locals.user.email },
			include: {
				workSpaces: {
					include: {
						boards: true
					}
				}
			}
		});

		const boards = user?.workSpaces;
		return {
			status: 200,
			body: boards || []
		};
	} catch (error) { return { status: 500, body: { message: 'Server error occured' } }; }
};
