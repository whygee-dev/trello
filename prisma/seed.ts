import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
	const password = await argon2.hash('secret');
	const usersData = [
		{ email: 'John@doe.com', username: 'John', fullname: 'John Smith', password },
		{
			email: faker.internet.email(),
			username: faker.internet.userName(),
			fullname: faker.name.findName(),
			password
		},
		{
			email: faker.internet.email(),
			username: faker.internet.userName(),
			fullname: faker.name.findName(),
			password
		}
	];

	const promises = usersData.map((userData) => {
		return prisma.user.create({
			include: { ownedWorkspaces: true },
			data: {
				email: userData.email,
				username: userData.username,
				fullname: userData.fullname,
				password,
				ownedWorkspaces: {
					create: {
						title: faker.lorem.lines(1),
						description: faker.lorem.lines(3),
						boards: {
							create: {
								title: faker.lorem.lines(1),
								description: faker.lorem.lines(3),
								columns: {
									create: [
										{
											title: 'To Do',
											index: 0,
											cards: {
												create: [
													{
														title: faker.lorem.lines(1),
														description: faker.lorem.lines(2),
														index: 0
													},
													{
														title: faker.lorem.lines(1),
														description: faker.lorem.lines(2),
														index: 1
													},
													{
														title: faker.lorem.lines(1),
														description: faker.lorem.lines(2),
														index: 2
													}
												]
											}
										},
										{
											title: 'Review',
											index: 1,
											cards: {
												create: {
													title: faker.lorem.lines(1),
													description: faker.lorem.lines(2),
													index: 0
												}
											}
										},
										{
											title: 'Done',
											index: 2,
											cards: {
												create: {
													title: faker.lorem.lines(1),
													description: faker.lorem.lines(2),
													index: 0
												}
											}
										}
									]
								}
							}
						}
					}
				}
			}
		});
	});
	const users = await Promise.all(promises);

	await Promise.all(
		users.map((user) => {
			return prisma.workSpace.update({
				where: { id: user.ownedWorkspaces[0].id },

				data: {
					users: {
						connect: users.map((u) => {
							return { id: u.id };
						})
					}
				}
			});
		})
	);

	/*await prisma.user.update({
		where: { id: user.id },
		data: {
			workSpaces: { connect: { id: workSpaces?.id } }
		}
	})*/
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
