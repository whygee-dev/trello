import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
    workspaceId: number,
    boardId: number
};

export const get: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 200, body: { message: 'Unauthorized' } };
		}

        const json: Body = await request.json();

		const columns = await prisma.user.find({
			where: { email: locals.user?.email }
        });

		const workspace = user?.workSpaces;

		return {
			status: 200,
			body: columns || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
