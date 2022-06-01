import type { RequestHandler } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import { prisma } from '../../../../db';
import { Validators } from '../../../../utils/validators';

type Body = {
	title: string;
	description: string;
	image: string;
};

export const patch: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		const validateDescription = Validators.validateTitle(json.description);
		const validateImage = Validators.validateImage(json.image?.split(',')[1]);

		if (!validateTitle.pass || !validateDescription.pass || !validateImage.pass) {
			return {
				status: 400,
				body: {
					errors: [validateTitle.message, validateDescription.message, validateImage.message]
				}
			};
		}

		const board = await prisma.board.findUnique({
			where: { id: params.id },
			include: {
				columns: { include: { cards: { include: { labels: true } } } },
				workSpace: { include: { users: true } }
			}
		});

		if (!board) {
			return { status: 400, body: { message: 'Forbidden' } };
		}

		const workSpace = board.workSpace;

		if (!workSpace || workSpace.ownerId !== locals.user.id) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const updated = await prisma.board.update({
			where: { id: params.id },
			data: {
				title: json.title,
				description: json.description,
				image: json.image ?? board.image
			}
		});

		return {
			status: 200,
			body: board || []
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
