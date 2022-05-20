import { writable } from 'svelte/store';

function buildValidator(validators: ((v: string) => any)[]) {
	return function validate(value: string, dirty: boolean) {
		if (!validators || validators.length === 0) {
			return { dirty, valid: true };
		}

		const failing = validators.find((v) => v(value) !== true);

		return {
			dirty,
			valid: !failing,
			message: failing && failing(value)
		};
	};
}

export { buildValidator };

export const createFieldValidator = (...validators: ((v: string) => any)[]) => {
	const { subscribe, set } = writable<{ dirty: boolean; valid: boolean; message?: string }>({
		dirty: false,
		valid: false,
		message: undefined
	});
	const validator = buildValidator(validators);

	function action(node: any, binding: string) {
		function validate(value: string, dirty: boolean) {
			const result = validator(value, dirty);
			set(result);
		}

		validate(binding, false);

		return {
			update(value: string) {
				validate(value, true);
			}
		};
	}

	const res: [SvelteStore<any>, (node: any, binding: string) => any] = [{ subscribe }, action];

	return res;
};
