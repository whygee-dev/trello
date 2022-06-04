import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

type Body = {
	id: string;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.id) {
			return {
				status: 400,
				body: ['Unauthorized operation']
			};
		}

		const workSpace = await prisma.workSpace.findFirst({
			where: { id: params.id, users: { some: { id: json.id } } },
			include: { users: true, owner: true }
		});

		if (!workSpace) {
			return {
				status: 401,
				body: ['Undefined WorkSpace']
			};
		}

		const userToRemove = await prisma.user.findUnique({ where: { id: json.id } });

		if (!userToRemove) {
			return {
				status: 400,
				body: ['Unauthorized operation']
			};
		}

		const authorized =
			workSpace.users.some((user) => user.id === locals.user!.id) ||
			workSpace.owner.id === locals.user!.id;

		if (userToRemove && workSpace && authorized) {
			await prisma.workSpace.update({
				where: { id: workSpace.id },
				data: { users: { disconnect: { id: userToRemove.id } } }
			});

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
