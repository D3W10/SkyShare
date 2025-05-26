import type { WebRTC } from "$lib/models/WebRTC.class";

export const connection = $state<{ c: WebRTC | null }>({ c: null });