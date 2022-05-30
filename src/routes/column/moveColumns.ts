import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	draggedColumnId: string;
	switchedColumnId: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
        if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.draggedColumnId
            || !json.switchedColumnId
            || typeof json.draggedColumnId !== 'string'
            || typeof json.switchedColumnId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid column ID'] }
			};
		}

		const draggedColumn =  await prisma.column.findFirst({
			where: {
				id: json.draggedColumnId,
				board: {
					workSpace: {
						users: {
							some: { id: locals.user.id }
						}
					}
				}
			}
		});

		const switchedColumn =  await prisma.column.findFirst({
			where: {
				id: json.switchedColumnId,
				board: {
					workSpace: {
						users: {
							some: { id: locals.user.id }
						}
					}
				}
			}
		});

		if (!draggedColumn || !switchedColumn) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const updateddraggedColumn = await prisma.column.update({
			where: { id: json.draggedColumnId },
			data: { yIndex: switchedColumn?.yIndex }
		});
		const updatedSwitchedColumn = await prisma.column.update({
			where: { id: json.switchedColumnId },
			data: { yIndex: draggedColumn?.yIndex }
		});

		return {
			status: 200,
			body: [updateddraggedColumn, updatedSwitchedColumn]
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
