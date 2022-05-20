import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

import * as argon2 from 'argon2';

import jwt from 'jsonwebtoken';

type Body = {
	email: string;
	password: string;
};

export const post: RequestHandler = async ({ request }) => {
	try {
		const json: Body = await request.json();

		if (!json.email || !json.password) {
			return { status: 401, body: { message: 'Email and password must be specified' } };
		}

		const prisma = new PrismaClient();

		const user = await prisma.user.findUnique({ where: { email: json.email } });

		if (!process.env.JWT_SECRET) {
			return { status: 500, body: { message: 'Server error occured' } };
		}

		if (!user) {
			return { status: 404, body: { message: 'Invalid credentials' } };
		}

		try {
			if (!(await argon2.verify(user.password, json.password))) {
				return { status: 404, body: { message: 'Invalid credentials' } };
			}
		} catch (error) {
			return { status: 404, body: { message: 'Invalid credentials' } };
		}

		const sign = jwt.sign(user, process.env.JWT_SECRET);

		const { password, ...body } = user;

		return {
			headers: {
				'set-cookie': `jwt=${sign}; Path=/; HttpOnly`
			},
			body: body as Partial<User>
		};
	} catch (error) {
		console.log(error);
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
