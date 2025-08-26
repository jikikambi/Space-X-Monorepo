<script lang="ts" setup>
import { listLaunches, type SortKey } from './LaunchList';

const {
  paginatedLaunches,
  totalPages,
  currentPage,
  searchQuery,
  sortKey,
  sortAsc,
  filterStatus,
  nextPage,
  prevPage,
  toggleSort,
  goTo
} = listLaunches(10);
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
      🚀 All Launches
    </h2>

    <!-- Filter toggle -->
   <div class="flex gap-2 mb-4">
      <button @click="filterStatus='all'" :class="['btn', 'btn-all', { 'btn-active': filterStatus==='all' }]">All</button>
      <button @click="filterStatus='upcoming'" :class="['btn', 'btn-upcoming', { 'btn-active': filterStatus==='upcoming' }]">Upcoming</button>
      <button @click="filterStatus='past'" :class="['btn', 'btn-past', { 'btn-active': filterStatus==='past' }]">Past</button>
    </div>

    <!-- Search input -->
    <div class="mb-6">
      <input v-model="searchQuery" type="text" placeholder="Search launches..." class="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-gray-100"/>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="table-auto w-full border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th @click="toggleSort('name' as SortKey)">Name <span v-if="sortKey==='name'">{{ sortAsc?'↑':'↓' }}</span></th>
            <th @click="toggleSort('status' as SortKey)">Status <span v-if="sortKey==='status'">{{ sortAsc?'↑':'↓' }}</span></th>
            <th @click="toggleSort('date' as SortKey)">Date <span v-if="sortKey==='date'">{{ sortAsc?'↑':'↓' }}</span></th>
            <th>Countdown</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="launch in paginatedLaunches" :key="launch.id" :class="['border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition', launch.isUrgent?'bg-red-50 dark:bg-red-900':'']">
            <td class="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{{ launch.name }}</td>
            <td class="px-6 py-4">
              <span :class="launch.isUpcoming ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'" :title="new Date(launch.date_utc).toLocaleString()">{{ launch.isUpcoming ? 'Upcoming' : 'Past' }}</span>
            </td>
            <td class="px-6 py-4 text-gray-700 dark:text-gray-300">{{ new Date(launch.date_utc).toLocaleDateString() }}</td>
            <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
              <span v-if="launch.isUpcoming" :class="launch.isUrgent?'text-red-600 font-bold animate-pulse':''" :title="launch.isUrgent?launch.tooltip:''">{{ launch.countdown }}</span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4">
              <button @click="goTo(launch.id)" class="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-8">
      <button @click="prevPage" :disabled="currentPage===1" class="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">◀ Prev</button>
      <span class="text-sm text-gray-500 dark:text-gray-400">Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage===totalPages" class="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">Next ▶</button>
    </div>
  </div>
</template>