<script>
	import { onMount } from 'svelte';

	let events = [];
	let feedUrl =
		'webcal://leffellschool.myschoolapp.com/podium/feed/iCal.aspx?z=6eChLkgRurBn1d0aq9640fp7PSVD6bPb9mnH7is7SP%2bmjAUt8L6eCDAk%2fH4nsjxYGfj98sPxNWuLIlE5Y3H9Gw%3d%3d';
	let loading = false;
	let error = null;

	async function fetchEvents() {
		loading = true;
		error = null;
		try {
			const response = await fetch(`/api/webcal?url=${encodeURIComponent(feedUrl)}`);
			if (!response.ok) {
				throw new Error('Failed to fetch events');
			}
			events = await response.json();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
	onMount(() => {
		fetchEvents();
	});
</script>

<main>
	<h1 class="text-center font-mono text-2xl p-2 font-bold">SchoolPad</h1>
	<form on:submit|preventDefault={fetchEvents}>
		<button type="submit" class="text-2xl top-1 left-1 absolute">🔃</button>
	</form>

	{#if loading}
		<p class="text-center text-3xl font-bold">Loading...</p>
	{:else if error}
		<p class="text-center text-red-500 font-bold text-4xl">{error} 😥</p>
	{:else if events.length > 0}
		<div class="grid grid-cols-1 gap-1 place-items-center">
			{#each events as event}
				<div class="p-3 bg-red-300 rounded-md">
					<h3 class="text-xl font-bold">{event.summary}</h3>
					<p>{new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}</p>
					{#if event.description}
						<p>{event.description}</p>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-center text-3xl font-bold">
			No events to display, click 🔃 to check for more. (possible just still loading)
		</p>
	{/if}
</main>
