import { PrismaClient, type Board } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

type Body = {
	email: string;
};

export const post: RequestHandler = async ({ request }) => {
	try {
		const prisma = new PrismaClient();
		const json: Body = await request.json();
		const userBoards = await prisma.user.findUnique({
			where: { email: json.email },
			include: {
				Board: true
			}
		});
		const sign = jwt.sign(JSON.stringify(userBoards), process.env.JWT_SECRET);
		const boards = userBoards?.Board;

		return {
			headers: {
				'set-cookie': `jwt=${sign}; Path=/; HttpOnly`
			},
			body: boards as Partial<Board>
		};
	} catch (error) {
		console.log(error);
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
