import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = { title: string; };

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const id = params.id
		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const column = await prisma.column.findUnique({ where: { id: id } });

		if (column) {
			const updatedColumn = await prisma.column.update({
				where: { id: id },
				data: { title: json.title }
			});
	
			return {
				status: 200,
				body: updatedColumn || {}
			};
		} else {
			return {
				status: 400,
				body: { errors: ['Undefined column'] }
			};
		}
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
