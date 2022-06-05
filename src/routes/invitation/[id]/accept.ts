import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const patch: RequestHandler = async ({ locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const user = await prisma.user.findUnique({
			where: { id: locals.user.id },
			include: { workSpaces: true }
		});

		if (user && user.workSpaces.some((workSpace) => workSpace.id === params.id)) {
			return {
				status: 400,
				body: { message: 'You are already in this workspace' }
			};
		}

		const updated = await prisma.user.update({
			where: { id: locals.user.id },
			data: {
				workSpaces: {
					connect: {
						id: params.id
					}
				}
			}
		});

		return {
			status: 200,
			body: updated
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
