import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const get: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workSpace = await prisma.workSpace.findFirst({
			where: { users: { some: { id: locals.user.id } } },
			include: { users: true }
		});

		if (!workSpace) {
			return {
				status: 401,
				body: ['Unauthorized operation']
			};
		}

		if (workSpace) {
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

			if (user) {
				const boards = user.workSpaces.map((workSpace) => workSpace.boards);

				return {
					status: 200,
					body: boards || []
				};
			}
		}

		return {
			status: 401,
			body: ['User not found']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
