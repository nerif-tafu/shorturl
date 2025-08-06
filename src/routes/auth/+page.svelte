<script lang="ts">
	import { onMount } from 'svelte';

	let isLogin = true;
	let email = '';
	let password = '';
	let isLoading = false;
	let error = '';
	let success = '';

	onMount(() => {
		const token = localStorage.getItem('token');
		if (token) {
			window.location.href = '/dashboard';
		}
	});

	async function handleSubmit() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		isLoading = true;
		error = '';
		success = '';

		try {
			const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (response.ok) {
				if (isLogin) {
					localStorage.setItem('token', data.token);
					window.location.href = '/dashboard';
				} else {
					success = 'Account created successfully! You can now log in.';
					isLogin = true;
					email = '';
					password = '';
				}
			} else {
				error = data.error || 'An error occurred';
			}
		} catch (err) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function toggleMode() {
		isLogin = !isLogin;
		error = '';
		success = '';
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				{isLogin ? 'Sign in to your account' : 'Create your account'}
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				{isLogin ? 'Or' : 'And'} 
				<button
					on:click={toggleMode}
					class="font-medium text-blue-600 hover:text-blue-500"
				>
					{isLogin ? 'create a new account' : 'sign in to existing account'}
				</button>
			</p>
		</div>
		<form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="email" class="sr-only">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="Email address"
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete={isLogin ? 'current-password' : 'new-password'}
						required
						bind:value={password}
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="Password"
					/>
				</div>
			</div>

			{#if error}
				<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-red-700">{error}</p>
				</div>
			{/if}

			{#if success}
				<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
					<p class="text-green-700">{success}</p>
				</div>
			{/if}

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
					{isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
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