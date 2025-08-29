<template>
  <div class="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
    <!-- Header -->
    <header class="bg-gray-800 text-white py-6 shadow-md">
      <h1 class="text-3xl md:text-4xl font-bold text-center">
        SpaceX Launch Dashboard
      </h1>
    </header>

    <!-- Main content -->
    <main class="flex-1 p-4 md:p-6">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="text-center text-gray-500 py-4 mt-6 border-t border-gray-300">
      &copy; {{ new Date().getFullYear() }} SpaceX Monorepo Dashboard
    </footer>
  </div>
</template>

<script lang="ts" setup>
</script>
