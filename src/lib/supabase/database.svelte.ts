import type { Tables } from '$lib/types/supabase';
import type {
	RealtimePostgresDeletePayload,
	RealtimePostgresInsertPayload
} from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import { user } from './auth.svelte';
import { supabase } from './init';

export async function joinMember(nickname: string, party_id: number) {
	const { data, error } = await supabase
		.from('party_members')
		.insert([{ nickname, party_id }])
		.select();

	return { data, error };
}

export async function isUserInParty(party_id: number) {
	if (!user.user) return null;
	const { data, error } = await supabase
		.from('party_members')
		.select('*')
		.eq('party_id', party_id)
		.eq('user_id', user.user.id);

	if (data && data.length > 0) return data[0];
	else return null;
}

export async function uploadPhoto(file: File, room: Tables<'parties'>) {
	if (!user.user) return;

	const result = await supabase
		.from('party_members')
		.select('*')
		.eq('party_id', room.id)
		.eq('user_id', user.user.id);

	if (result.data && user.user) {
		const photoId = uuid();
		const { data, error } = await supabase.storage
			.from('photos')
			.upload(`${room.host_user_id}/${photoId}.png`, file);
		console.log(data, error);
		const db = await supabase
			.from('photos')
			.insert([
				{
					party_member_id: result.data[0].id,
					bucket_file_id: `${room.host_user_id}/${photoId}`,
					party_id: room.id
				}
			])
			.select();
		console.log(db);
	}
}

export async function getPhotos(
	party: number,
	member: number | null = null
): Promise<Tables<'photos'>[]> {
	let photos = [];
	if (member) {
		const { data, error } = await supabase
			.from('photos')
			.select('*')
			.eq('party_id', party)
			.eq('party_member_id', member);
		photos = data ?? [];
	} else {
		const { data, error } = await supabase.from('photos').select('*').eq('party_id', party);
		photos = data ?? [];
	}

	return photos;
}

export async function deletePhoto(id: number, bucket_path: string) {
	const res = await supabase.storage.from('photos').remove([bucket_path + '.png']);
	const { error } = await supabase.from('photos').delete().eq('id', id);
	console.log(res, bucket_path + '.png');
	console.log(error);
	return error;
}

export async function kickMember(member_id: number, deletePhotos: boolean) {
	if (deletePhotos) {
		const { error } = await supabase.from('photos').delete().eq('party_member_id', member_id);
	}
	const { error } = await supabase
		.from('party_members')
		.update({ kicked: true })
		.eq('id', member_id);
}

export async function getPartyById(party: number): Promise<Tables<'parties'> | null> {
	const { data, error } = await supabase.from('parties').select('*').eq('id', party);
	console.log(data);
	return data ? data[0] : null;
}

export async function getPartyByCode(party: string): Promise<Tables<'parties'> | null> {
	const { data, error } = await supabase.from('parties').select('*').eq('join_code', party);
	return data ? data[0] : null;
}

export async function getMembers(party: number): Promise<Tables<'party_members'>[]> {
	const { data, error } = await supabase.from('party_members').select('*').eq('party_id', party);
	console.log(data);
	return data ?? [];
}

export async function getMemberById(id: number): Promise<Tables<'party_members'> | null> {
	const { data, error } = await supabase.from('party_members').select('*').eq('id', id);
	console.log(data);
	return data ? data[0] : null;
}

export function createPhotosStore(
	initial: Tables<'photos'>[],
	party: number,
	member: number | null = null
) {
	let photos: Tables<'photos'>[] | { [key: string]: any }[] = $state(initial);
	const sorted = $derived(
		photos.toSorted((a, b) => {
			if (a.created_at < b.created_at) {
				return 1;
			}
			if (a.created_at > b.created_at) {
				return -1;
			}
			return 0;
		})
	);

	const photosSubscribe = supabase
		.channel('photos-insert')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'photos', filter: `party_id=eq.${party}` },
			(payload) => {
				console.log(payload);

				if (payload.eventType === 'INSERT') {
					if (member && payload.new.party_member_id !== member) return;
					photos = [...photos, payload.new];
				} else if (payload.eventType === 'DELETE') {
					if (!photos.some((photo) => photo.id === payload.old.id)) return;
					const index = photos.findIndex((photo) => photo.id === payload.old.id);
					photos.splice(index, 1);
				}
			}
		)
		.subscribe();
	return {
		get photos() {
			return sorted;
		}
	};
}

export function createMembersStore(initial: Tables<'party_members'>[], party: number) {
	let members: Tables<'party_members'>[] | { [key: string]: any }[] = $state(initial);

	const photosSubscribe = supabase
		.channel('members_update')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'party_members', filter: `party_id=eq.${party}` },
			(payload) => {
				console.log(payload);

				if (payload.eventType === 'INSERT') {
					members = [...members, payload.new];
				} else if (payload.eventType === 'DELETE') {
					if (!members.some((member) => member.id === payload.old.id)) return;
					const index = members.findIndex((member) => member.id === payload.old.id);
					members.splice(index, 1);
				}
			}
		)
		.subscribe();
	return {
		get members() {
			return members;
		}
	};
}

export function onPhotosUpdate(
	filters: {
		party: number;
		member?: number;
	},
	eventHandlers: {
		insert?: (payload: RealtimePostgresInsertPayload<any>) => void;
		delete?: (payload: RealtimePostgresDeletePayload<any>) => void;
	}
) {
	const photosSubscribe = supabase
		.channel('photos-insert')
		.on(
			'postgres_changes',
			{ event: '*', schema: 'public', table: 'photos', filter: `party_id=eq.${filters.party}` },
			(payload) => {
				console.log(payload);

				if (payload.eventType === 'INSERT' && eventHandlers.insert) {
					if (filters.member && payload.new.party_member_id !== filters.member) return;
					eventHandlers.insert(payload);
				} else if (payload.eventType === 'DELETE' && eventHandlers.delete) {
					eventHandlers.delete(payload);
				}
			}
		)
		.subscribe();
	return photosSubscribe;
}
