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

	static passwordValidator() {
		return (v: string) => {
			const b = Validators.validatePassword(v);

			return b.pass || b.message;
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

	static emailValidator() {
		return (v: string) => {
			const b = Validators.validateEmail(v);

			return b.pass || b.message;
		};
	}

	static validateUsername(u: string) {
		const pass = // eslint-disable-next-line no-control-regex
			/^[A-Za-z][A-Za-z0-9_]{3,20}$/.test(u);

		return {
			pass,
			message: !pass
				? 'Username length must be between 4 and 20 characters and contain only alphabet characters'
				: undefined
		};
	}

	static usernameValidator() {
		return (v: string) => {
			const b = Validators.validateUsername(v);

			return b.pass || b.message;
		};
	}

	static validateFullname(f: string) {
		const pass = /(?=^.{2,40}$)^[a-zA-Z-]+\s[a-zA-Z-]+$/.test(f);

		return {
			pass,
			message: !pass
				? 'Fullname must be between 2 and 20 characters, contain only alphanumeric characters, firstname and lastname separated by a whitespace.'
				: undefined
		};
	}

	static fullnameValidator() {
		return (v: string) => {
			const b = Validators.validateFullname(v);

			return b.pass || b.message;
		};
	}

	static validateTitle(u: string) {
		const pass = u && u.length <= 100 && u.length >= 2;

		return {
			pass,
			message: !pass ? 'Title length must be between 2 and 100 characters' : undefined
		};
	}

	static titleValidator() {
		return (v: string) => {
			const b = Validators.validateTitle(v);

			return b.pass || b.message;
		};
	}

	static validateDescription(u: string) {
		const pass = u && u.length <= 200 && u.length >= 10;

		return {
			pass,
			message: !pass ? 'Description length must be between 10 and 200 ' : undefined
		};
	}

	static descriptionValidator() {
		return (v: string) => {
			const b = Validators.validateDescription(v);

			return b.pass || b.message;
		};
	}

	static validateImage(base64?: string) {
		const sizeInBytes = 4 * Math.ceil(base64?.length || 0 / 3) * 0.5624896334383812;
		const sizeInKb = sizeInBytes / 1024;

		const passSize = sizeInKb < 2024;
		let passReg = false;

		if (passSize) {
			passReg =
				!base64 || /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(base64);
		}

		return {
			pass: passReg && passReg,
			message: !passSize
				? 'Image too big, max 2MB'
				: !passReg
				? 'Invalide image encoding. Must be in base64 '
				: undefined
		};
	}

	static imageValidator() {
		return (v: string) => {
			const b = Validators.validateImage(v);

			return b.pass || b.message;
		};
	}
}
