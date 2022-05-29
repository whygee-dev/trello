import type { Board } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const get: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

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
			const workspaces = user.workSpaces;

			const boards: Board[] = [];

			workspaces.forEach((w) => boards.push(...w.boards));

			return {
				status: 200,
				body: boards || []
			};
		}

		return {
			status: 401,
			body: ['User not found']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
