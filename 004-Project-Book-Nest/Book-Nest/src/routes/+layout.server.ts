import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = await locals.getUser();
    return {
        user: user && {
            email: user.email,
            name: (user.user_metadata.name as string | undefined) ?? '',
        },
    };
};
