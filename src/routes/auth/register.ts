import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import * as argon2 from 'argon2';
import { Validators } from '../../utils/validators';
import jwt from 'jsonwebtoken';

type Body = {
	username: string;
	email: string;
	password: string;
	fullname: string;
};

export const post: RequestHandler = async ({ request }) => {
	try {
		const json: Body = await request.json();

		if (!process.env.JWT_SECRET) {
			return { status: 500, body: { message: 'Server error occured' } };
		}

		const validateEmail = Validators.validateEmail(json.email);
		const validatePassword = Validators.validatePassword(json.password);
		const validateUsername = Validators.validateUsername(json.username);
		const validateFullname = Validators.validateFullname(json.fullname);

		if (
			!validateEmail.pass ||
			!validatePassword.pass ||
			!validateUsername.pass ||
			!validateFullname.pass
		) {
			return {
				status: 401,
				body: {
					errors: [
						validateEmail.message,
						validatePassword.message,
						validateUsername.message,
						validateFullname.message
					]
				}
			};
		}

		const prisma = new PrismaClient();

		const existant = await prisma.user.findUnique({ where: { email: json.email } });

		if (existant) {
			return {
				status: 401,
				body: { message: 'An account associated with the given email already exists' }
			};
		}

		const user = await prisma.user.create({
			data: {
				username: json.username,
				email: json.email,
				password: await argon2.hash(json.password),
				fullname: json.fullname
			}
		});

		const { password, ...body } = user;

		const sign = jwt.sign(body, process.env.JWT_SECRET);

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
