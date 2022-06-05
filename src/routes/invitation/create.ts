import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';

type Body = {
	duration: Date;
	boardId: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const days = 24 * 60 * 60 * 1000;
		const hours = 60 * 60 * 1000;
		const minutes = 60 * 1000;

		if (!request.body) return { status: 403, body: { message: 'Forbidden' } };

		const json: Body = await request.json();

		let link: string;

		if (!json.duration) {
			return { status: 403, body: { message: 'A datetime must be specified' } };
		}

		const limit = new Date(json.duration);

		const board = await prisma.board.findUnique({
			where: { id: json.boardId },
			include: { workSpace: true }
		});

		if (!board) {
			return { status: 404, body: { message: 'Board not found' } };
		}

		if (board) {
			const invitation = await prisma.invitation.create({
				data: {
					validFor: new Date(json.duration),
					workSpace: { connect: { id: board?.workSpace.id } }
				}
			});

			link = encodeURI(`http://localhost:3000/invitation/${invitation.id}`);

			return {
				status: 201,
				body: link || {}
			};
		}

		return {
			status: 404,
			body: {
				errors: ['Board not found']
			}
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
