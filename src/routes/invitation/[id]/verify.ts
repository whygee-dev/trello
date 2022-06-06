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
			const actualDate = new Date();
			const limitDate = new Date(invitation.validFor);

			const diff = Math.floor(limitDate.getTime() - actualDate.getTime());
			const diffDays = Math.floor(diff / days);
			const diffHours = Math.floor((diff % days) / hours);
			const diffMinutes = Math.floor((diff % hours) / minutes);

			if (diffDays < 0 && diffHours < 0 && diffMinutes < 0) {
				return {
					status: 403,
					body: ['The invitation is expired']
				};
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
