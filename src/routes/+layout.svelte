<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>ShortURL</title>
	<meta name="description" content="Create custom short URLs with tracking, expiration dates, and password protection. Free URL shortener with analytics." />
	<link rel="icon" href="/favicon.jpg" type="image/jpeg" />
</svelte:head>

{@render children?.()}
