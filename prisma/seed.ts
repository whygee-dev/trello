import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
	const password = await argon2.hash('secret');
	await prisma.user.create({
		data: {
			email: 'John@doe.com',
			username: 'John',
			password: password,
			Board: {
				create: {
					title: 'Board Seed',
					Column: {
						create: {
							title: 'Column Seed',
							Card: {
								create: {
									title: 'Card Seed',
									description: 'Card description',
									date: '1997-07-16T19:20:30.451Z',
									label: {
										create: {
											title: 'label Seed',
											color: '#ff0000'
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
