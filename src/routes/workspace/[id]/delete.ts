import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const del: RequestHandler = async ({ locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workspaceId = params.id;
		const workSpace = await prisma.workSpace.findUnique({ where: { id: workspaceId } });
		const user = await prisma.user.findUnique({ where: { email: locals.user.email } });

		if (workSpace && user && user.id === workSpace.ownerId) {
			await prisma.workSpace.delete({ where: { id: workSpace.id } });

			return {
				status: 200,
				body: workSpace || {}
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
