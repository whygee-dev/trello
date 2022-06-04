import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	email: string;
	boardId: string;
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		if (!request.body) return { status: 403, body: { message: 'Forbidden' } };

		const json: Body = await request.json();
		const validateEmail = Validators.validateEmail(json.email);
		let link: string;

		if (!validateEmail.pass) {
			return {
				status: 400,
				body: {
					errors: [validateEmail.message]
				}
			};
		}

		const user = await prisma.user.findUnique({
			where: { email: json.email },
			include: { workSpaces: { include: { boards: true } } }
		});

		if (!user) {
			return {
				status: 400,
				body: {
					errors: ['User not found']
				}
			};
		}

		const alreadyMember = user.workSpaces.find((workSpace) =>
			workSpace.boards.some((board) => board.id === json.boardId)
		);

		if (alreadyMember) {
			return {
				status: 409,
				body: {
					errors: ['User is already member of this board']
				}
			};
		}

		const board = await prisma.board.findUnique({
			where: { id: json.boardId },
			include: { workSpace: true }
		});

		if (board) {
			const invitation = await prisma.invitation.create({
				data: {
					validFor: user.id,
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
