import { writable } from "svelte/store";

export const loggedIn = writable(false);
export const fireName = writable('');
export const fireMail = writable('');