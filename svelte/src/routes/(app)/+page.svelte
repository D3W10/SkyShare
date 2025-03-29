<script lang="ts">
    import { i18n } from "$lib/data/i18n.svelte";
    import PageLayout from "$lib/components/PageLayout.svelte";

    let greetingKey = $state("home.morning");

    function updateGreeting() {
        let currentHour = new Date().getHours();

        if (currentHour >= 6 && currentHour <= 12)
            greetingKey = "home.morning";
        else if (currentHour >= 13 && currentHour <= 19)
            greetingKey = "home.afternoon";
        else if (currentHour >= 20 || currentHour <= 5)
            greetingKey = "home.evening";
    }

    updateGreeting();
    setInterval(updateGreeting, 60000);
</script>

<PageLayout title={i18n.t(greetingKey)}>
    
</PageLayout>