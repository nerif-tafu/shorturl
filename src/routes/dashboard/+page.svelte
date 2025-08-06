<script lang="ts">
	import { onMount } from 'svelte';

	let urls: any[] = [];
	let isLoading = true;
	let error = '';
	let selectedUrl: any = null;
	let showAnalytics = false;
	let analytics: any = null;
	let showEditModal = false;
	let editingUrl: any = null;
	let isLoggedIn = false;

	onMount(async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '/';
			return;
		}

		isLoggedIn = true;
		await loadUrls();
	});

	async function loadUrls() {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/urls', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				urls = data.urls;
			} else {
				error = 'Failed to load URLs';
			}
		} catch (err) {
			error = 'Network error';
		} finally {
			isLoading = false;
		}
	}

	async function loadAnalytics(urlId: string) {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/urls/${urlId}/clicks`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				analytics = data;
				showAnalytics = true;
			} else {
				error = 'Failed to load analytics';
			}
		} catch (err) {
			error = 'Network error';
		}
	}

	async function deleteUrl(urlId: string) {
		if (!confirm('Are you sure you want to delete this URL?')) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/urls/${urlId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				urls = urls.filter(url => url.id !== urlId);
			} else {
				error = 'Failed to delete URL';
			}
		} catch (err) {
			error = 'Network error';
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}

	function logout() {
		localStorage.removeItem('token');
		window.location.href = '/';
	}

	function editUrl(url: any) {
		editingUrl = { ...url };
		showEditModal = true;
	}

	async function updateUrl() {
		if (!editingUrl) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`/api/urls/${editingUrl.id}`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					originalUrl: editingUrl.originalUrl,
					slug: editingUrl.slug,
					title: editingUrl.title,
					description: editingUrl.description,
					expiresAt: editingUrl.expiresAt,
					password: editingUrl.password,
					isActive: editingUrl.isActive
				})
			});

			if (response.ok) {
				const data = await response.json();
				// Update the URL in the list with the response data
				urls = urls.map(url => 
					url.id === editingUrl.id ? { ...url, ...data.url } : url
				);
				showEditModal = false;
				editingUrl = null;
			} else {
				const data = await response.json();
				error = data.error || 'Failed to update URL';
			}
		} catch (err) {
			error = 'Network error';
		}
	}

	function cancelEdit() {
		showEditModal = false;
		editingUrl = null;
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-6">
				<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
				<div class="flex items-center space-x-3">
					<a
						href="/"
						class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
						</svg>
						<span>Create</span>
					</a>
					<button
						on:click={logout}
						class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
						</svg>
						<span>Logout</span>
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if error}
			<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
				<p class="text-red-700">{error}</p>
			</div>
		{/if}

		{#if isLoading}
			<div class="text-center py-12">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				<p class="mt-2 text-gray-600">Loading your URLs...</p>
			</div>
		{:else}
			<!-- Stats -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div class="bg-white rounded-lg shadow p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total URLs</dt>
								<dd class="text-lg font-medium text-gray-900">{urls.length}</dd>
							</dl>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg shadow p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Clicks</dt>
								<dd class="text-lg font-medium text-gray-900">
									{urls.reduce((sum, url) => sum + (url.clickCount || 0), 0)}
								</dd>
							</dl>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg shadow p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Active URLs</dt>
								<dd class="text-lg font-medium text-gray-900">
									{urls.filter(url => url.isActive).length}
								</dd>
							</dl>
						</div>
					</div>
				</div>
				<div class="bg-white rounded-lg shadow p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Protected URLs</dt>
								<dd class="text-lg font-medium text-gray-900">
									{urls.filter(url => url.password).length}
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- URLs List -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Your URLs</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Short URL
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Original URL
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Clicks
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Created
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each urls as url}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center space-x-2">
											<a
												href={url.shortUrl}
												target="_blank"
												class="text-blue-600 hover:text-blue-900 font-medium"
											>
												{url.slug}
											</a>
											<button
												on:click={() => copyToClipboard(url.shortUrl)}
												class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 transition-colors"
												title="Copy URL"
											>
												<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
												</svg>
											</button>
										</div>
									</td>
									<td class="px-6 py-4">
										<div class="text-sm text-gray-900 truncate max-w-xs">
											{url.originalUrl}
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{url.clickCount || 0}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatDate(url.createdAt)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {url.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
											{url.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div class="flex space-x-3">
											<button
												on:click={() => editUrl(url)}
												class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
												title="Edit URL"
											>
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
												</svg>
											</button>
											<button
												on:click={() => loadAnalytics(url.id)}
												class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
												title="View Analytics"
											>
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
												</svg>
											</button>
											<button
												on:click={() => deleteUrl(url.id)}
												class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
												title="Delete URL"
											>
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
												</svg>
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			{#if urls.length === 0}
				<div class="text-center py-12">
					<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
					</svg>
					<h3 class="mt-2 text-sm font-medium text-gray-900">No URLs</h3>
					<p class="mt-1 text-sm text-gray-500">Get started by creating your first short URL.</p>
					<div class="mt-6">
						<a
							href="/"
							class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
						>
							Create URL
						</a>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Analytics Modal -->
	{#if showAnalytics && analytics}
		<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
			<div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
				<div class="mt-3">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-lg font-medium text-gray-900">Click Analytics</h3>
						<button
							on:click={() => showAnalytics = false}
							class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 transition-colors"
							title="Close"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
					
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Time
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										IP Address
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User Agent
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Referer
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								{#each analytics.clicks as click}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(click.timestamp)}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{click.ip}
										</td>
										<td class="px-6 py-4 text-sm text-gray-900">
											<div class="truncate max-w-xs">
												{click.userAgent}
											</div>
										</td>
										<td class="px-6 py-4 text-sm text-gray-900">
											<div class="truncate max-w-xs">
												{click.referer}
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					{#if analytics.pagination}
						<div class="mt-4 text-center text-sm text-gray-500">
							Page {analytics.pagination.page} of {analytics.pagination.pages} 
							({analytics.pagination.total} total clicks)
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Edit URL Modal -->
	{#if showEditModal && editingUrl}
		<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
			<div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
				<div class="mt-3">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-lg font-medium text-gray-900">Edit URL</h3>
						<button
							on:click={cancelEdit}
							class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-50 transition-colors"
							title="Close"
						>
							<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
					</div>
					
					<form on:submit|preventDefault={updateUrl} class="space-y-4">
						<div>
							<label for="edit-original-url" class="block text-sm font-medium text-gray-700 mb-2">
								Original URL
							</label>
							<input
								id="edit-original-url"
								type="url"
								bind:value={editingUrl.originalUrl}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label for="edit-slug" class="block text-sm font-medium text-gray-700 mb-2">
								Custom Slug
							</label>
							<input
								id="edit-slug"
								type="text"
								bind:value={editingUrl.slug}
								placeholder="Leave empty for auto-generated slug"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">
								Current short URL: {editingUrl.shortUrl}
							</p>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="edit-title" class="block text-sm font-medium text-gray-700 mb-2">
									Title (optional)
								</label>
								<input
									id="edit-title"
									type="text"
									bind:value={editingUrl.title}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label for="edit-description" class="block text-sm font-medium text-gray-700 mb-2">
									Description (optional)
								</label>
								<input
									id="edit-description"
									type="text"
									bind:value={editingUrl.description}
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<div>
							<label for="edit-expires-at" class="block text-sm font-medium text-gray-700 mb-2">
								Expires At (optional)
							</label>
							<input
								id="edit-expires-at"
								type="datetime-local"
								value={editingUrl.expiresAt ? editingUrl.expiresAt.slice(0, 16) : ''}
								on:input={(e) => editingUrl.expiresAt = (e.target as HTMLInputElement).value}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label for="edit-password" class="block text-sm font-medium text-gray-700 mb-2">
								Password (optional)
							</label>
							<input
								id="edit-password"
								type="password"
								bind:value={editingUrl.password}
								placeholder="Leave empty to remove password protection"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>

						<div class="flex items-center space-x-3">
							<input
								id="edit-is-active"
								type="checkbox"
								bind:checked={editingUrl.isActive}
								class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label for="edit-is-active" class="text-sm font-medium text-gray-700">
								Active
							</label>
						</div>

						<div class="flex justify-end space-x-3 pt-4">
							<button
								type="button"
								on:click={cancelEdit}
								class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
							>
								Cancel
							</button>
							<button
								type="submit"
								class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Update URL
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div> 