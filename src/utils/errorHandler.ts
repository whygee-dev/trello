import { toast } from '@zerodevx/svelte-toast';

export const handleError = (error: any) => {
	console.log(error);
	toast.pop(0);

	if (Array.isArray(error.response.data.errors)) {
		error.response.data.errors.forEach((element: string) => {
			element && toast.push(element);
		});
	} else {
		toast.push(
			error.response.data.message || error.response.data.error || 'An unexpected error occured'
		);
	}
};
