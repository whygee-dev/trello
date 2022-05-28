import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	workSpaceId: number;
	userId: number;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.userId || typeof json.userId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid user ID'] }
			};
		} else if (!json.workSpaceId || typeof json.workSpaceId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid workspace ID'] }
			};
		}

		const user = await prisma.user.findUnique({ where: { id: json.userId } });
		const workSpace = await prisma.workSpace.findUnique({ where: { id: json.workSpaceId } });

		if (user && workSpace && user.id === workSpace.ownerId) {
			const workSpace = await prisma.workSpace.update({
				where: { id: json.workSpaceId },
				include: { users: true },
				data: { users: { connect: { id: user.id } } }
			});

			return {
				status: 200,
				body: workSpace || {}
			};
		}

		return {
			status: 400,
			body: { errors: ['Unauthorized operation'] }
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
