import { getMemberById, getPartyByCode, getPhotos } from '$lib/supabase/database.svelte';
import { supabase } from '$lib/supabase/init';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { id, code } = params;

	const party = await getPartyByCode(params.code);
	if (!party) error(400, { message: 'Party not found' });
	const member = await getMemberById(parseInt(id));
    if (!member) error(400, { message: 'Member not found' });
	const photos = party && member ? await getPhotos(party.id, member.id) : [];
	return {
		party,
		member,
		photos
	};
};
