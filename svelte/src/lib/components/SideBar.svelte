<script lang="ts">
    import { tweened } from "svelte/motion";
    import { i18n } from "$lib/stores/i18nStore";
    import { page } from "$lib/stores/pageStore";
    import { disable } from "$lib/stores/disableStore";
    import Icon from "./Icon.svelte";
    import Button from "./Button.svelte";

    const duration = 2000, shine = tweened(0, {
		duration
	});

    function shineScroll() {
        shine.set(-200);
        setTimeout(() => {
            shine.set(0, { duration: 0 });
            shineScroll();
        }, duration);
    }

    shineScroll();
</script>

<div class="w-80 px-4 py-2 space-y-4">
    <Button type="invisible" className="w-full flex items-center justify-start font-semibold space-x-3" disabled={$disable} on:click={() => page.set("login")}>
        <Icon name="account" className="w-14 text-primary transition-colors" />
        <p class={$page.current == "login" || $page.current == "account" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors" : ""} style:background-image={$page.current == "login" || $page.current == "account" ? "linear-gradient(to right, #FFC847, rgb(var(--color-account)), #E09D00, rgb(var(--color-account)), #FFC847)" : ""} style:background-position="{$shine}%">{$i18n.t("sidebar.login")}</p>
    </Button>
    <hr class="w-full h-[3px] bg-foreground/10 border-0 rounded-full">
    <div>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" disabled={$disable} on:click={() => page.set("home")}>
            <Icon name="home" className="w-8 {$page.current == "home" ? "text-[rgb(var(--color-home))]" : ""} transition-colors" />
            <p class={$page.current == "home" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors" : ""} style:background-image={$page.current == "home" ? "linear-gradient(to right, #4493EE, rgb(var(--color-home)), #1160BB, rgb(var(--color-home)), #4493EE)" : ""} style:background-position="{$shine}%">{$i18n.t("sidebar.home")}</p>
        </Button>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" disabled={$disable} on:click={() => page.set("send")}>
            <Icon name="send" className="w-8 {$page.current == "send" ? "text-[rgb(var(--color-send))]" : ""} transition-colors" />
            <p class={$page.current == "send" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors" : ""} style:background-image={$page.current == "send" ? "linear-gradient(to right, #FF7088, rgb(var(--color-send)), #F50029, rgb(var(--color-send)), #FF7088)" : ""} style:background-position="{$shine}%">{$i18n.t("sidebar.send")}</p>
        </Button>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" disabled={$disable} on:click={() => page.set("receive")}>
            <Icon name="receive" className="w-8 {$page.current == "receive" ? "text-[rgb(var(--color-receive))]" : ""} transition-colors" />
            <p class={$page.current == "receive" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors" : ""} style:background-image={$page.current == "receive" ? "linear-gradient(to right, #47F0FF, rgb(var(--color-receive)), #00A8B8, rgb(var(--color-receive)), #47F0FF)" : ""} style:background-position="{$shine}%">{$i18n.t("sidebar.receive")}</p>
        </Button>
        <Button type="invisible" className="w-full p-2 flex items-center justify-start font-semibold space-x-3" disabled={$disable} on:click={() => page.set("settings")}>
            <Icon name="settings" className="w-8 {$page.current == "settings" ? "text-[rgb(var(--color-settings))]" : ""} transition-colors" />
            <p class={$page.current == "settings" ? "text-transparent bg-[length:200%] bg-clip-text transition-colors" : ""} style:background-image={$page.current == "settings" ? "linear-gradient(to right, #F5933D, rgb(var(--color-settings)), #D46A0D, rgb(var(--color-settings)), #F5933D)" : ""} style:background-position="{$shine}%">{$i18n.t("sidebar.settings")}</p>
        </Button>
    </div>
</div>