import { getMembers, getPartyByCode, getPhotos } from '$lib/supabase/database.svelte.js';
import { supabase } from '$lib/supabase/init';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const code = params.code;

	// let parties = await supabase
	// 	.from('parties')
	// 	.select('*')
	// 	// Filters
	// 	.eq('join_code', code);

	const party = await getPartyByCode(code);
	if (!party) error(400, { message: 'Party not found' });
	const photos = await getPhotos(party.id);
	const members = await getMembers(party.id);

	return {
		party,
		photos,
		members,
		code
	};
};
