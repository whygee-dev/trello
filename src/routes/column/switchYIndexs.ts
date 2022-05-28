import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	draggedColumnId: number;
	switchedColumnId: number
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
        if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();

		if (!json.draggedColumnId
            || !json.switchedColumnId
            || typeof json.draggedColumnId !== 'number'
            || typeof json.switchedColumnId !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid column ID'] }
			};
		}

		const draggedColumn = await prisma.column.findUnique({ where: { id: json.draggedColumnId } });
        const switchedColumn = await prisma.column.findUnique({ where: { id: json.switchedColumnId } });

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
			body: [updateddraggedColumn, updatedSwitchedColumn] || []
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
