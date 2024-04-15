<script lang="ts">
    import "../app.css";
    import { app } from "$lib/stores/appStore";

    if ($app)
        $app.updateOfflineCallback(() => !navigator.onLine);
</script>

<slot />