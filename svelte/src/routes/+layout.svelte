<script lang="ts">
    import "../app.css";
    import { app } from "$lib/stores/appStore";

    $app?.updateOfflineCallback(() => !navigator.onLine);
</script>

<slot />