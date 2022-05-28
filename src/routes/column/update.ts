import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	id: number;
	title: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);

		if (!json.id || typeof json.id !== 'number') {
			return {
				status: 400,
				body: { errors: ['Invalid column ID'] }
			};
		} else if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const column = await prisma.column.update({
			where: { id: json.id },
			data: { title: json.title }
		});

		return {
			status: 200,
			body: column || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
