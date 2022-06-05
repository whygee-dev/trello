import type { RequestHandler } from '@sveltejs/kit';
import PubNub from 'pubnub';

export const get: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return { status: 401, body: { message: 'Unauthorized' } };
	}

	try {
		const tokenParams = {
			ttl: 1024,
			authorized_uuid: locals.user.id,
			resources: { channels: {} }
		} as any;

		const user = await prisma?.user.findUnique({
			where: { id: locals.user.id },
			include: { workSpaces: { include: { boards: true } } }
		});

		user?.workSpaces.forEach((workSpace) => {
			workSpace.boards.forEach((board) => {
				tokenParams.resources.channels['board-' + board.id] = { read: true, write: true };
			});
		});

		const pubnub = new PubNub({
			publishKey: 'pub-c-be25a5ac-e5c9-451f-9070-e27717cc1b26',
			subscribeKey: 'sub-c-fda059c7-710d-4e8e-875d-08c257b7fb4b',
			secretKey: 'sec-c-ZGEzZjI2ZTAtMjQwZS00ZGU5LWFlMjktNjY2NWQwMGRiMDg2',
			uuid: locals.user.id
		});

		const token = await pubnub.grantToken(tokenParams);

		return { status: 200, body: { token } };
	} catch (status) {
		console.log(status);

		return { status: 500, body: { error: 'Internal Server Error' } };
	}
};
