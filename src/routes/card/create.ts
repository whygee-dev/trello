import type { Label } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../db';
import { Validators } from '../../utils/validators';

type Body = {
	columnId: string;
	title: string;
	description: string;
	date: Date;
	cover: string;
	labels: Label[];
	users: User[];
};

export const post: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const json: Body = await request.json();
		const validateTitle = Validators.validateTitle(json.title);
		const validateCover = Validators.validateImage(json.cover?.split(',')[1]);

		if (!json.columnId || typeof json.columnId !== 'string') {
			return {
				status: 400,
				body: { errors: ['Invalid column ID'] }
			};
		} else if (!validateTitle.pass || !validateCover.pass) {
			return {
				status: 400,
				body: { errors: [validateTitle.message, validateCover.message] }
			};
		}

		const column = await prisma.column.findFirst({
			where: {
				id: json.columnId,
				board: {
					workSpace: {
						users: {
							some: { id: locals.user.id }
						}
					}
				}
			},
			include: { board: { include: { workSpace: { include: { users: true } } } } }
		});

		if (!column) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		if (
			!json.users
				.map((u) => {
					return column.board.workSpace.users.find((user) => user.id === u!.id);
				})
				.every((user) => user !== undefined)
		) {
			return {
				status: 403,
				body: { errors: ['Unauthorized operation'] }
			};
		}

		if (
			!json.labels
				.map((l) => {
					const validateLabel = Validators.validateLabel(l.title);
					const validateColor = Validators.validateColor(l.color);

					return validateLabel.pass && validateColor.pass;
				})
				.every((label) => !!label)
		) {
			return {
				status: 400,
				body: { errors: ['Invalid label (between 2 and 40 characters) or color representation'] }
			};
		}

		const count = await prisma.card.count({ where: { column: { id: json.columnId } } });
		const index = count + 1;

		const card = await prisma.card.create({
			data: {
				title: json.title,
				description: json.description,
				date: json.date,
				cover: json.cover ?? null,
				index,
				column: { connect: { id: column?.id } },
				labels: { createMany: { data: json.labels } },
				users: {
					connect: json.users
						.map((user) => (user ? { id: user.id } : null))
						.filter((user) => !!user) as any[]
				}
			}
		});

		return {
			status: 201,
			body: card || {}
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
