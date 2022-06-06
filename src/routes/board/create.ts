import type { RequestHandler } from '@sveltejs/kit';
import { writeFileSync } from 'fs';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	workspaceId: string;
	title: string;
	image: string;
	description: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		if (!request.body) return { status: 403, body: { message: 'Forbidden' } };

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		const validateDescription = json.description
			? Validators.validateDescription(json.description)
			: null;
		const validateImage = Validators.validateImage(json.image?.split(',')[1]);

		if (validateDescription && !validateDescription.pass) {
			return {
				status: 400,
				body: {
					errors: [validateTitle.message, validateDescription.message]
				}
			};
		}

		if (!validateTitle.pass || !validateImage.pass) {
			return {
				status: 400,
				body: {
					errors: [validateTitle.message, validateImage.message]
				}
			};
		}

		if (!json.workspaceId) {
			return {
				status: 400,
				body: { errors: ['Workspace required'] }
			};
		}

		const workSpace = await prisma.workSpace.findUnique({
			where: { id: json.workspaceId },
			include: { users: true }
		});

		if (!workSpace || workSpace.ownerId !== locals.user.id) {
			return {
				status: 400,
				body: ['Unauthorized operation']
			};
		}

		const board = await prisma.board.create({
			data: {
				title: json.title,
				description: json.description,
				workSpaceId: workSpace.id,
				image: json.image ?? null,
				columns: {
					create: {
						title: 'To Do',
						index: 0,
						cards: {
							create: {
								title: 'Hello World!',
								description: 'Hello World!',
								index: 0
							}
						}
					}
				}
			}
		});

		// if (json.image) {
		// 	writeFileSync(`static/board-${board.id}.png`, json.image, 'base64');

		// 	await prisma.board.update({
		// 		where: { id: board.id },
		// 		data: { image: `board-${board.id}.png` }
		// 	});
		// }

		return {
			status: 201,
			body: board || {}
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
