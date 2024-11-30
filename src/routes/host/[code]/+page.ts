// import { supabase } from '$lib/supabase/init';

import { getPartyByCode, getPhotos } from "$lib/supabase/database.svelte";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";


// export const load = async ({ params }) => {
// 	const code = params.code;

// 	let { data, error } = await supabase
// 		.from('parties')
// 		.select('*')
// 		// Filters
// 		.eq('join_code', code);

//     const party = data? data[0] : [];

// 	return {
//         party,
// 		code
// 	};
// };

export const load: PageLoad = async ({params}) => {
    const code = params.code;
    const party = await getPartyByCode(code);
	if (!party) error(400, { message: 'Party not found' });
	const photos = await getPhotos(party.id);

    return {
        photos
    }
};
