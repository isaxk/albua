
import { supabase } from './init';
import type { Session, User } from '@supabase/supabase-js';

export const user: { user: null | User } = $state({ user: null });

export async function signInAnonomously() {
	const { data, error } = await supabase.auth.signInAnonymously();
	user.user = data.user;
	return { data, error };
}

export async function signInWithGoogle() {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'google'
	});
	if(error) console.log(error);
	return {data, error};
}

export async function signOut() {
	await supabase.auth.signOut();
}

supabase.auth.onAuthStateChange((_, session: Session|null)=>{
	console.log(session);
    user.user = session?.user ?? null;
})
