import type { Launch } from '@space-x/shared/Launch';
import { TableManager } from './TableManager';
import { fetchLaunches } from '../services/api';
import { ref, computed } from 'vue';
import router from '../router';

export type SortKey = 'name' | 'status' | 'date';
export type FilterStatus = 'all' | 'upcoming' | 'past';

export function listLaunches(pageSize = 10) {
  const manager = new TableManager<Launch>({
    fetchData: fetchLaunches,
    pageSize,
  });

  const filterStatus = ref<FilterStatus>('all');

  // Step 1: Enrich launches with countdown, urgent flag, tooltip
  const processedLaunches = computed(() =>
    manager.items.value.map((launch) => {
      const launchTime = new Date(launch.date_utc).getTime();
      const diff = launchTime - manager.now.value;
      const isUpcoming = diff > 0;
      const isUrgent = isUpcoming && diff <= 1000 * 60 * 60; // < 1 hour

      let countdown = '';
      if (isUpcoming) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }

      return {
        ...launch,
        isUpcoming,
        isUrgent,
        countdown,
        tooltip: new Date(launch.date_utc).toLocaleString(),
      };
    })
  );

  // Step 2: Filter by search + status
  const filteredLaunches = computed(() =>
    processedLaunches.value
      .filter((launch) =>
        launch.name.toLowerCase().includes(manager.searchQuery.value.toLowerCase())
      )
      .filter((launch) => {
        if (filterStatus.value === 'upcoming') return launch.isUpcoming;
        if (filterStatus.value === 'past') return !launch.isUpcoming;
        return true;
      })
  );

  // Step 3: Sorting (special handling for status & date)
  const sortedLaunches = computed(() => {
    if (!manager.sortKey.value) return filteredLaunches.value;

    const key = manager.sortKey.value as SortKey;
    return [...filteredLaunches.value].sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (key === 'status') {
        valA = a.isUpcoming ? 'Upcoming' : 'Past';
        valB = b.isUpcoming ? 'Upcoming' : 'Past';
      } else if (key === 'date') {
        valA = new Date(a.date_utc).getTime();
        valB = new Date(b.date_utc).getTime();
      } else if (key === 'name') {
        valA = a.name;
        valB = b.name;
      } else {
        valA = '';
        valB = '';
      }

      return valA < valB ? (manager.sortAsc.value ? -1 : 1)
           : valA > valB ? (manager.sortAsc.value ? 1 : -1)
           : 0;
    });
  });

  // Step 4: Pagination
  const totalPages = computed(() =>
    Math.ceil(sortedLaunches.value.length / manager.pageSize)
  );
  const paginatedLaunches = computed(() => {
    const start = (manager.currentPage.value - 1) * manager.pageSize;
    return sortedLaunches.value.slice(start, start + manager.pageSize);
  });

  // Navigation helpers
  function nextPage() {
    if (manager.currentPage.value < totalPages.value) manager.currentPage.value++;
  }
  function prevPage() {
    if (manager.currentPage.value > 1) manager.currentPage.value--;
  }
  function toggleSort(key: SortKey) {
    if (manager.sortKey.value === key) {
      manager.sortAsc.value = !manager.sortAsc.value;
    } else {
      manager.sortKey.value = key;
      manager.sortAsc.value = true;
    }
  }
  function goTo(id: string) {
    router.push(`/launches/${id}`);
  }

  return {
    paginatedLaunches,
    totalPages,
    currentPage: manager.currentPage,
    searchQuery: manager.searchQuery,
    sortKey: manager.sortKey,
    sortAsc: manager.sortAsc,
    filterStatus,
    nextPage,
    prevPage,
    toggleSort,
    goTo,
  };
}