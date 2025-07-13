<script lang="ts">
    import { Tween } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { i18n } from "$lib/data/i18n.svelte";

    let { 
        progress = 0, 
        size = 250, 
        strokeWidth = 25,
        duration = 600 
    } = $props();

    let animatedProgress = new Tween(0, {
        duration,
        easing: cubicOut
    });

    $effect(() => {
        animatedProgress.target = Math.max(0, Math.min(100, progress));
    });

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    const totalAngle = 283;
    const progressRatio = $derived(animatedProgress.current / 100);
    const arcLength = $derived((totalAngle / 360) * circumference);
    const offset = $derived(arcLength * (1 - progressRatio));

    function createArcPath(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
        const start = polarToCartesian(centerX, centerY, radius, startAngle);
        const end = polarToCartesian(centerX, centerY, radius, endAngle);
        const largeArcFlag = "1";

        return [
            "M", start.x, start.y, 
            "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
        ].join(" ");
    }

    function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    const baseArcPath = createArcPath(center, center, radius, 135, 45);
    const arcPath = createArcPath(center, center, radius, 122, 45);
</script>

<div class="flex flex-col items-center gap-4">
    <div class="relative">
        <svg width={size} height={size} class="rotate-90">
            <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color: color-mix(in oklab, var(--color-accent), white 20%); stop-opacity: 1;" />
                    <stop offset="50%" style="stop-color: var(--color-accent); stop-opacity: 1;" />
                    <stop offset="100%" style="stop-color: color-mix(in oklab, var(--color-accent), black 20%); stop-opacity: 1;" />
                </linearGradient>
                <mask id="progressMask" maskContentUnits="userSpaceOnUse" x="-0.1" y="-0.1" width={size} height={size}>
                    <rect x="0" y="0" width={size} height={size} fill="black" />
                    <path
                        d={baseArcPath}
                        fill="none"
                        stroke="white"
                        stroke-width={strokeWidth}
                        stroke-linecap="round"
                    />
                </mask>
            </defs>
            <path
                class="stroke-slate-200 dark:stroke-slate-950"
                d={baseArcPath}
                fill="none"
                stroke-width={strokeWidth}
                stroke-linecap="round"
            />
            <path
                d={arcPath}
                fill="none"
                stroke="url(#progressGradient)"
                stroke-width={strokeWidth}
                stroke-linecap="round"
                stroke-dasharray={arcLength}
                stroke-dashoffset={offset}
                mask="url(#progressMask)"
            />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-y-1 text-center">
            <p class="mt-2 text-5xl font-bold">{Math.round(animatedProgress.current)}</p>
            <p class="text-slate-500">{i18n.t("send.transfer.progress")}</p>
        </div>
    </div>
</div>
