// import { supabase } from '$lib/supabase/init';


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
