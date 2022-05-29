import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
	const password = await argon2.hash('secret');
	const usersData = [
		{ email: 'John@doe.com', username: 'John', fullname: 'John Smith', password, id: '' },
		{ email: 'Zack@doe.com', username: 'Zack', fullname: 'Zack reetler', password, id: '' },
		{ email: 'Rick@doe.com', username: 'Rick', fullname: 'Rick Astley', password, id: '' }
	];

	const promises = usersData.map((userData) => {
		return prisma.user.create({
			data: {
				email: userData.email,
				username: userData.username,
				fullname: userData.fullname,
				password,
				ownedWorkspaces: {
					create: {
						title: `workspace created by ${userData.username}`,
						description: 'Workspace Seed description',
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
	});
	const users = await Promise.all(promises);

	users.forEach(async (user) => {
		prisma.user.findUnique({
			where: { id: user.id },
			include: { workSpaces: { include: { users: true } } }
		});

	/*	await prisma.user.update({
			where: { id: user.id },
			data: {
				workSpaces: { connect: { id: workSpaces?.id } }
			}
		});*/
	});
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
