import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

type Body = {
	userId: number;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workspaceId = params.id;
		const json: Body = await request.json();

		if (!json.userId || typeof json.userId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid user ID'] }
			};
		}

		const user = await prisma.user.findUnique({ where: { id: workspaceId } });
		const workSpace = await prisma.workSpace.findUnique({ where: { id: workspaceId } });

		if (user && workSpace && user.id === workSpace.ownerId) {
			const updatedWorkSpace = await prisma.workSpace.update({
				where: { id: workSpace.id },
				include: { users: true },
				data: { users: { disconnect: { id: user.id } } }
			});

			return {
				status: 200,
				body: updatedWorkSpace || []
			};
		}

		return {
			status: 400,
			body: { errors: ['Unauthorized operation '] }
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
