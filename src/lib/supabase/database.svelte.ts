import type { UpdatePayload } from 'vite';
import { user } from './auth.svelte';
import { supabase } from './init';
import { v4 as uuid } from 'uuid';
import type {
	RealtimePostgresDeletePayload,
	RealtimePostgresInsertPayload
} from '@supabase/supabase-js';
import { memory } from '@sveu/browser';
import type { Tables } from '$lib/types/supabase';

export async function joinMember(nickname: string, party_id: number) {
	const { data, error } = await supabase
		.from('party_members')
		.insert([{ nickname, party_id }])
		.select();

	return { data, error };
}

export async function isUserInParty(party_id: number) {
	if (!user.user) return false;
	const { data, error } = await supabase
		.from('party_members')
		.select('*')
		.eq('party_id', party_id)
		.eq('user_id', user.user.id);

	if (data && data.length > 0) return true;
	else return false;
}

export async function uploadPhoto(file: File, room: number) {
	if (!user.user) return;

	const result = await supabase
		.from('party_members')
		.select('*')
		.eq('party_id', room)
		.eq('user_id', user.user.id);

	if (result.data && user.user) {
		const photoId = uuid();
		const { data, error } = await supabase.storage
			.from('photos')
			.upload(`${room}/${photoId}.png`, file);
		console.log(data, error);
		const db = await supabase
			.from('photos')
			.insert([
				{
					party_member_id: result.data[0].id,
					bucket_file_id: `${room}/${photoId}`,
					party_id: room
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
	return error;
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
	member: number | null = null,
) {
	let photos: Tables<'photos'>[] | { [key: string]: any }[] = $state(initial);

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
			return photos;
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
