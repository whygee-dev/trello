import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

export const get: RequestHandler = async ({ locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const user = await prisma.user.findUnique({
			where: { email: locals.user.email },
			include: { workSpaces: { include: { boards: true, users: true } } }
		});

		const workSpace = await prisma.workSpace.findUnique({ where: { id: params.id } });

		if (!workSpace) {
			return {
				status: 401,
				body: ['Undefined WorkSpace']
			};
		}

		if (user && workSpace && user.id === workSpace.ownerId) {
			const workspaces = user.workSpaces;

			return {
				status: 200,
				body: workspaces || []
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
