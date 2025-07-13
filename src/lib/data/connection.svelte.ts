import type { WebRTC } from "$lib/models/WebRTC.class.svelte";

export const connection = $state<{ c: WebRTC | null }>({ c: null });