import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';
import { Validators } from './../../../utils/validators';
import argon2 from 'argon2';

type Body = {
	fullname: string;
	username: string;
	image: string;
	password: string;
};

export const patch: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		let user = await prisma.user.findUnique({ where: { id: locals.user.id } });

		const json: Body = await request.json();
		const validateFullname = Validators.validateFullname(json.fullname);

		if (json.password) {
			const validatePassword = Validators.validatePassword(json.password);

			if (validatePassword && !validatePassword.pass) {
				return {
					status: 400,
					body: {
						errors: [validateFullname.message, validatePassword.message]
					}
				};
			}
		}

		const validateUsername = Validators.validateUsername(json.username);
		const validateImage = Validators.validateImage(json.image?.split(',')[1]);

		if (!validateFullname.pass || !validateImage.pass || !validateUsername.pass) {
			return {
				status: 400,
				body: {
					errors: [validateFullname.message, validateImage.message, validateUsername.message]
				}
			};
		}

		if (user && json.password) {
			user = await prisma.user.update({
				where: { id: locals.user.id },
				data: {
					fullname: json.fullname,
					username: json.username,
					image: json.image,
					password: await argon2.hash(json.password)
				}
			});

			return {
				status: 200,
				body: user || []
			};
		}

		user = await prisma.user.update({
			where: { id: locals.user.id },
			data: {
				fullname: json.fullname,
				username: json.username,
				image: json.image
			}
		});

		return {
			status: 200,
			body: user || []
		};
	} catch (error) {
		console.log(error);

		return { status: 500, body: { message: 'Server error occured' } };
	}
};
