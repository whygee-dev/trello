import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	workSpaceId: number;
	userId: number;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) { return { status: 401, body: { message: 'Unauthorized' } }; }

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
        if (user) {
            const workSpace = await prisma.workSpace.update({
                where: { id: json.workSpaceId },
				include: { users: true },
                data: { users: { connect: { id: user.id } } }
            });
            return {
                status: 200,
                body: workSpace || {}
            };
        } else {
			return {
				status: 400,
				body: { errors: ['Undefined user'] }
			};
		}
	} catch (error) { return { status: 500, body: { message: 'Server error occured' } }; }
};
