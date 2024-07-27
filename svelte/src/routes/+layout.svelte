<script lang="ts">
    import "../app.css";
    import { app } from "$lib/stores/appStore";

    $app?.updateCallback("offline", () => !navigator.onLine);
</script>

<slot />