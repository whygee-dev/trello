import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '../../../db';

export const get: RequestHandler = async ({ locals, params }) => {
	try {
		if (!locals.user) {
			return { status: 401, body: { message: 'Unauthorized' } };
		}

		const days = 24 * 60 * 60 * 1000;
		const hours = 60 * 60 * 1000;
		const minutes = 60 * 1000;
		const seconds = 1000;

		const invitation = await prisma.invitation.findUnique({
			where: { id: params.id },
			include: { workSpace: { include: { boards: true } } }
		});

		if (!invitation) {
			return {
				status: 401,
				body: ['Invitation not found ']
			};
		}

		if (invitation) {
			if (invitation.validFor === locals.user.id) {
				const actualDate = new Date();
				const createdDate = new Date(invitation.createdAt);

				const diff = Math.floor(actualDate.getTime() - createdDate.getTime());

				const diffDays = Math.floor(diff / days);
				const diffHours = Math.floor((diff % days) / hours);
				//const diffMinutes = Math.floor((diff % hours) / minutes);
				//const diffSeconds = Math.floor((diff % minutes) / seconds);

				if (diffDays > 0 && diffHours > 5) {
					return {
						status: 400,
						body: { message: 'Invitation expired' }
					};
				}
			}
		}

		return {
			status: 200,
			body: invitation
		};
	} catch (error) {
		return { status: 500, body: { message: 'Server error occured' } };
	}
};
