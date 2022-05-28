import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const post: RequestHandler = async ({ locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workspaceId = params.id;

		const workSpace = await prisma.workSpace.findUnique({ where: { id: workspaceId } });

		if (workSpace) {
			return {
				status: 200,
				body: workSpace || []
			};
		}

		return {
			status: 400,
			body: ['Workspace not found']
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
