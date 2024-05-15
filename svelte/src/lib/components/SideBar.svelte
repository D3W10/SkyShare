<script lang="ts">
    import { scale } from "svelte/transition";
    import { quartIn, quartOut } from "svelte/easing";
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { account } from "$lib/stores/accountStore";
    import Icon from "./Icon.svelte";
    import Button from "./Button.svelte";
</script>

<div class="w-full max-w-64 px-4 py-2 space-y-4">
    <Button type="invisible" className="w-full flex items-center justify-start font-semibold space-x-3" on:click={() => page.set(!$account.loggedIn ? "login" : "account")}>
        <div class="w-14 flex justify-center items-center relative aspect-square">
            {#if !$account.loggedIn || !$account.photo}
                <div class="w-full h-full" in:scale={{ duration: 1000, delay: 1000, easing: quartOut, opacity: 1 }} out:scale={{ duration: 1000, easing: quartIn, opacity: 1 }}>
                    <Icon name="account" className="absolute text-primary transition-colors" />
                </div>
            {:else}
                <img src={$account.photo} alt="{$account.username} Profile Picture" class="w-full max-h-14 absolute rounded-full aspect-square" in:scale={{ duration: 1000, delay: 1000, easing: quartOut, opacity: 1 }} out:scale={{ duration: 1000, easing: quartIn, opacity: 1 }} />
            {/if}
        </div>
        <p class={$page.current == "login" || $page.current == "account" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors animate-[shine_2s_linear_infinite]" : ""} style:background-image={$page.current == "login" || $page.current == "account" ? "linear-gradient(to right, #F5933D, rgb(var(--color-account)), #D46A0D, rgb(var(--color-account)), #F5933D)" : ""}>{!$account.loggedIn ? $i18n.t("sidebar.login") : $account.username}</p>
    </Button>
    <hr class="w-full h-[3px] bg-foreground/10 border-0 rounded-full">
    <div>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" on:click={() => page.set("home")}>
            <Icon name="home" className="w-8 {$page.current == "home" ? "text-[rgb(var(--color-home))]" : ""} transition-colors" />
            <p class={$page.current == "home" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors animate-[shine_2s_linear_infinite]" : ""} style:background-image={$page.current == "home" ? "linear-gradient(to right, #4493EE, rgb(var(--color-home)), #1160BB, rgb(var(--color-home)), #4493EE)" : ""}>{$i18n.t("sidebar.home")}</p>
        </Button>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" on:click={() => page.set("send")}>
            <Icon name="send" className="w-8 {$page.current == "send" ? "text-[rgb(var(--color-send))]" : ""} transition-colors" />
            <p class={$page.current == "send" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors animate-[shine_2s_linear_infinite]" : ""} style:background-image={$page.current == "send" ? "linear-gradient(to right, #FF7088, rgb(var(--color-send)), #F50029, rgb(var(--color-send)), #FF7088)" : ""}>{$i18n.t("sidebar.send")}</p>
        </Button>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" on:click={() => page.set("receive")}>
            <Icon name="receive" className="w-8 {$page.current == "receive" ? "text-[rgb(var(--color-receive))]" : ""} transition-colors" />
            <p class={$page.current == "receive" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors animate-[shine_2s_linear_infinite]" : ""} style:background-image={$page.current == "receive" ? "linear-gradient(to right, #47F0FF, rgb(var(--color-receive)), #00A8B8, rgb(var(--color-receive)), #47F0FF)" : ""}>{$i18n.t("sidebar.receive")}</p>
        </Button>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" on:click={() => page.set("settings")}>
            <Icon name="settings" className="w-8 {$page.current == "settings" ? "text-[rgb(var(--color-settings))]" : ""} transition-colors" />
            <p class={$page.current == "settings" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors animate-[shine_2s_linear_infinite]" : ""} style:background-image={$page.current == "settings" ? "linear-gradient(to right, #594ED0, rgb(var(--color-settings)), #2F2791, rgb(var(--color-settings)), #594ED0)" : ""}>{$i18n.t("sidebar.settings")}</p>
        </Button>
    </div>
</div>