<script lang="ts">
	import { onMount } from 'svelte';

	let originalUrl = '';
	let customSlug = '';
	let title = '';
	let description = '';
	let expiresAt = '';
	let password = '';
	let useCustomSlug = false;
	let useExpiration = false;
	let usePassword = false;
	let isLoading = false;
	let result: any = null;
	let error = '';
	let isLoggedIn = false;
	let user: any = null;

	onMount(() => {
		const token = localStorage.getItem('token');
		if (token) {
			isLoggedIn = true;
			// You could verify the token here
		}
	});

	async function createShortUrl() {
		if (!originalUrl) {
			error = 'Please enter a URL';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const token = localStorage.getItem('token');
			const headers: Record<string, string> = {
				'Content-Type': 'application/json'
			};

			if (token) {
				headers['Authorization'] = `Bearer ${token}`;
			}

			const response = await fetch('/api/urls', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					originalUrl,
					customSlug: useCustomSlug ? customSlug : undefined,
					title: title || undefined,
					description: description || undefined,
					expiresAt: useExpiration ? expiresAt : undefined,
					password: usePassword ? password : undefined
				})
			});

			const data = await response.json();

			if (response.ok) {
				result = data.url;
				// Reset form
				originalUrl = '';
				customSlug = '';
				title = '';
				description = '';
				expiresAt = '';
				password = '';
				useCustomSlug = false;
				useExpiration = false;
				usePassword = false;
			} else {
				error = data.error || 'Failed to create short URL';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-4">
				<div class="flex items-center">
					<h1 class="text-xl font-bold text-gray-900">ShortURL</h1>
				</div>
				<div class="flex items-center space-x-4">
					{#if isLoggedIn}
						<a
							href="/dashboard"
							class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
						>
							Dashboard
						</a>
						<button
							on:click={() => { localStorage.removeItem('token'); window.location.reload(); }}
							class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
						>
							Logout
						</button>
					{:else}
						<a
							href="/auth"
							class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
						>
							Sign In
						</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">
				ShortURL Generator
			</h1>
			<p class="text-lg text-gray-600 max-w-2xl mx-auto">
				Create short, memorable links with advanced features like custom slugs, expiration dates, and password protection.
			</p>
		</div>

		<!-- Main Form -->
		<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
			<form on:submit|preventDefault={createShortUrl} class="space-y-6">
				<!-- URL Input -->
				<div>
					<label for="url" class="block text-sm font-medium text-gray-700 mb-2">
						Original URL *
					</label>
					<input
						id="url"
						type="url"
						bind:value={originalUrl}
						placeholder="https://example.com/very-long-url"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						required
					/>
				</div>

				<!-- Custom Slug -->
				<div class="flex items-center space-x-3">
					<input
						id="customSlug"
						type="checkbox"
						bind:checked={useCustomSlug}
						class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
					/>
					<label for="customSlug" class="text-sm font-medium text-gray-700">
						Use custom slug
					</label>
				</div>

				{#if useCustomSlug}
					<div>
						<label for="slug" class="block text-sm font-medium text-gray-700 mb-2">
							Custom Slug
						</label>
						<input
							id="slug"
							type="text"
							bind:value={customSlug}
							placeholder="my-custom-link"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				{/if}

				<!-- Title and Description -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="title" class="block text-sm font-medium text-gray-700 mb-2">
							Title (optional)
						</label>
						<input
							id="title"
							type="text"
							bind:value={title}
							placeholder="My Link Title"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
							Description (optional)
						</label>
						<input
							id="description"
							type="text"
							bind:value={description}
							placeholder="Brief description"
							class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>

				<!-- Advanced Options -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium text-gray-900">Advanced Options</h3>
					
					<!-- Expiration -->
					<div class="flex items-center space-x-3">
						<input
							id="expiration"
							type="checkbox"
							bind:checked={useExpiration}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="expiration" class="text-sm font-medium text-gray-700">
							Set expiration date
						</label>
					</div>

					{#if useExpiration}
						<div>
							<label for="expiresAt" class="block text-sm font-medium text-gray-700 mb-2">
								Expires At
							</label>
							<input
								id="expiresAt"
								type="datetime-local"
								bind:value={expiresAt}
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					{/if}

					<!-- Password Protection -->
					<div class="flex items-center space-x-3">
						<input
							id="password"
							type="checkbox"
							bind:checked={usePassword}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label for="password" class="text-sm font-medium text-gray-700">
							Password protect this link
						</label>
					</div>

					{#if usePassword}
						<div>
							<label for="passwordInput" class="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<input
								id="passwordInput"
								type="password"
								bind:value={password}
								placeholder="Enter password"
								class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					{/if}
				</div>

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isLoading ? 'Creating...' : 'Create Short URL'}
				</button>
			</form>

			<!-- Error Message -->
			{#if error}
				<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-red-700">{error}</p>
				</div>
			{/if}

			<!-- Success Result -->
			{#if result}
				<div class="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
					<h3 class="text-lg font-medium text-green-900 mb-4">Short URL Created!</h3>
					<div class="space-y-3">
						<div>
							<label class="block text-sm font-medium text-gray-700">Short URL:</label>
							<div class="flex items-center space-x-2 mt-1">
								<input
									type="text"
									value={result.shortUrl}
									readonly
									class="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50"
								/>
								<button
									type="button"
									on:click={() => copyToClipboard(result.shortUrl)}
									class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
								>
									Copy
								</button>
							</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Original URL:</label>
							<p class="text-sm text-gray-600 mt-1 break-all">{result.originalUrl}</p>
						</div>
						{#if result.title}
							<div>
								<label class="block text-sm font-medium text-gray-700">Title:</label>
								<p class="text-sm text-gray-600 mt-1">{result.title}</p>
							</div>
						{/if}
						{#if result.expiresAt}
							<div>
								<label class="block text-sm font-medium text-gray-700">Expires:</label>
								<p class="text-sm text-gray-600 mt-1">{new Date(result.expiresAt).toLocaleString()}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
