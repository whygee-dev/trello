import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export const post: RequestHandler = async ({ request }) => {
	try {
		const json = await request.json();

		const prisma = new PrismaClient();

		const user = await prisma.user.findUnique({ where: { email: json.email } });

		if (!process.env.JWT_SECRET) {
			return { status: 500, body: { message: 'Server error occured' } };
		}

		if (!user) {
			return { status: 404, body: { message: 'Invalid credentials' } };
		}

		// try {
		// 	if (!(await argon2.verify(user.password, json.password))) {
		// 		return { status: 404, body: { message: 'Invalid credentials' } };
		// 	}
		// } catch (error) {
		// 	return { status: 404, body: { message: 'Invalid credentials' } };
		// }

		const sign = jwt.sign(user, process.env.JWT_SECRET);

		return {
			headers: {
				'set-cookie': `jwt=${sign}; Path=/; HttpOnly`
			},
			body: user
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
