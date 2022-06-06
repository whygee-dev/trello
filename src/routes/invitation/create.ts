import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { isPast } from 'date-fns';

type Body = {
	duration: Date;
	boardId: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		if (!request.body) return { status: 403, body: { message: 'Forbidden' } };

		const json: Body = await request.json();

		let link: string;

		if (!json.duration) {
			return { status: 403, body: { message: 'A datetime must be specified' } };
		}

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

			const invitations = await prisma.invitation.findMany({});

			const expiredInvitations = invitations.filter((inv) => isPast(inv.validFor));

			if (expiredInvitations.length > 0) {
				expiredInvitations.forEach(async (inv) => {
					await prisma.invitation.delete({ where: { id: inv.id } });
				});
			}

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
