import { getPartyByCode } from '$lib/supabase/database.svelte.js';
import { supabase } from '$lib/supabase/init';
import { error } from '@sveltejs/kit';


export const load = async ({ params }) => {
	const code = params.code;

	const party = await getPartyByCode(code);
	if(!party) error(400, {message: "party not found"})

	return {
        party,
		code
	};
};
