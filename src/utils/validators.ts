export class Validators {
	static validatePassword(p: string) {
		const pass = /((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))/.test(p);

		return {
			pass,
			message: !pass
				? 'Password must consist of 8 characters or more including atleast 1 number, 1 uppercase letter and 1 lowercase letter'
				: undefined
		};
	}

	static validateEmail(e: string) {
		const pass = // eslint-disable-next-line no-control-regex
			/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
				e
			);

		return {
			pass,
			message: !pass ? 'Invalid email' : undefined
		};
	}

	static validateUsername(u: string) {
		const pass = // eslint-disable-next-line no-control-regex
			/^[A-Za-z][A-Za-z0-9_]{4,20}$)/.test(u);
		return {
			pass,
			message: !pass
				? 'Username length must be between 4 and 20 and contain only alphanumeric characters'
				: undefined
		};
	}

	static validateFullname(f: string) {
		const pass = /(?=^.{2,40}$)^[a-zA-Z-]+\s[a-zA-Z-]+$/.test(f);
		return {
			pass,
			message: !pass
				? 'Fullname length must be between 2 and 20 and contain only alphanumeric characters'
				: undefined
		};
	}
}
