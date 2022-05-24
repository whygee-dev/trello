import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
	const password = await argon2.hash('secret');

	await prisma.user.create({
		data: {
			email: 'John@doe.com',
			username: 'John',
			fullname: 'John Smith',
			password,
			workSpaces: {
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
									cards: {
										create: {
											title: 'Card Seed',
											description: 'Card description',
											date: '1997-07-16T19:20:30.451Z'
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
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
