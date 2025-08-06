<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let password = '';
	let isLoading = false;
	let error = '';
	let urlData: any = null;

	onMount(async () => {
		const slug = $page.params.slug;
		if (slug) {
			await checkUrlStatus(slug);
		}
	});

	async function checkUrlStatus(slug: string) {
		try {
			const response = await fetch(`/${slug}`);
			
			if (response.status === 401) {
				const data = await response.json();
				if (data.requiresPassword) {
					urlData = data;
					return;
				}
			}
			
			// If not password protected, redirect should have happened automatically
			// If we reach here, there might be an error
			const data = await response.json();
			error = data.error || 'An error occurred';
		} catch (err) {
			error = 'Network error. Please try again.';
		}
	}

	async function submitPassword() {
		if (!password) {
			error = 'Please enter a password';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch(`/api/urls/${urlData.urlId}/access`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password })
			});

			if (response.ok) {
				const data = await response.json();
				// Redirect to the original URL
				window.location.href = data.redirectUrl;
			} else {
				const data = await response.json();
				error = data.error || 'Invalid password';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
				<svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
				</svg>
			</div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Password Protected
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				This link is password protected. Please enter the password to continue.
			</p>
		</div>

		{#if error}
			<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
				<p class="text-red-700">{error}</p>
			</div>
		{/if}

		<form class="mt-8 space-y-6" on:submit|preventDefault={submitPassword}>
			<div>
				<label for="password" class="sr-only">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					bind:value={password}
					class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
					placeholder="Enter password"
				/>
			</div>

			<div>
				<button
					type="submit"
					disabled={isLoading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isLoading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					{/if}
					{isLoading ? 'Verifying...' : 'Continue'}
				</button>
			</div>

			<div class="text-center">
				<a href="/" class="font-medium text-blue-600 hover:text-blue-500">
					← Back to home
				</a>
			</div>
		</form>
	</div>
</div> 