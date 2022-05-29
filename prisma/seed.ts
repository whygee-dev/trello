import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
	const password = await argon2.hash('secret');

	const user = await prisma.user.create({
		data: {
			email: 'John@doe.com',
			username: 'John',
			fullname: 'John Smith',
			password,
			ownedWorkspaces: {
				create: {
					title: 'Workspace Seed title',
					description: 'Workspace Seed description',
					type: 'Workspace Seed type',
					boards: {
						create: {
							title: 'Board Seed',
							description: 'Board Seed description',
							columns: {
								create: {
									title: 'Column Seed',
									yIndex: 0,
									cards: {
										create: {
											title: 'Card Seed',
											description: 'Card description',
											xIndex: 0
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});

	const workSpaces = await prisma.workSpace.findFirst();

	await prisma.user.update({
		where: { id: user.id },
		data: {
			workSpaces: { connect: { id: workSpaces?.id } }
		}
	});
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
