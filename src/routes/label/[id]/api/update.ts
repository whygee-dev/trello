import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = {
	title: string;
	color: string;
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
		} else if (json.color && typeof json.color !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid color type parameter'] }
			};
		}

		const label = await prisma.label.findUnique({ where: { id: id } });
		
		if (!label) {
			return {
				status: 400,
				body: { errors: ['Undefined label'] }
			};
		}

		const updatedLabel = await prisma.label.update({
			where: { id: id },
			data: {
				title: json.title,
				color: json.color
			}
		});

		return {
			status: 200,
			body: updatedLabel || {}
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
