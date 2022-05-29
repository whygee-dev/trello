import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = {
	title: string;
	description: string;
	date: Date;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const workSpace = await prisma.workSpace.findFirst({
			where: { users: { some: { id: locals.user.id } } },
			include: { users: true }
		});

		if (!workSpace?.users[0]) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		const id = params.id;
		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		
		if (!validateTitle.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message] }
			};
		}

		const card = await prisma.card.findUnique({ where: { id: id } });

		if (!card) {
			return {
				status: 400,
				body: { errors: ['Undefined card'] }
			};
		}

		const updatedCard = await prisma.card.update({
			where: { id: id },
			data: {
				title: json.title,
				description: json.description,
				date: json.date
			}
		});

		return {
			status: 200,
			body: updatedCard || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
