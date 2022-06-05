import type { Column } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	columns: Column[];
	boardId: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.columns || !json.boardId || typeof json.boardId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid column ID'] }
			};
		}

		const boardCondition = {
			id: json.boardId,
			workSpace: {
				users: {
					some: { id: locals.user.id }
				}
			}
		};

		const columns = await prisma.column.findMany({
			where: {
				id: { in: json.columns.map((c) => c.id) },
				board: boardCondition
			}
		});

		if (columns.length !== json.columns.length) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		await Promise.all(
			json.columns.map(async (c, index) => {
				return prisma.column.update({
					where: { id: c.id },
					data: { index }
				});
			})
		);

		return {
			status: 200,
			body: { message: 'OK' }
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
