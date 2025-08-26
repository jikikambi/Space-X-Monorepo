import { logger } from '@space-x/shared/logger';
import { ref, computed } from 'vue';

export type SortKey = string;

export interface TableItem {
  id: string;
}

export type TableOptions<T, R = T[] | { data: T[] }> = {
  fetchData: () => Promise<R>; // accept either T[] or AxiosResponse-like object
  pageSize?: number;
};

export class TableManager<T, R = T[] | { data: T[] }> {
  items = ref<T[]>([]);
  currentPage = ref(1);
  pageSize: number;
  searchQuery = ref('');
  sortKey = ref<SortKey | null>(null);
  sortAsc = ref(true);
  filters = ref<((item: T) => boolean)[]>([]);

  now = ref(Date.now());
  interval: ReturnType<typeof setInterval> | undefined;
  private options: TableOptions<T, R>;

  constructor(options: TableOptions<T, R>) {
    this.pageSize = options.pageSize ?? 10;
    this.options = options;
    this.startClock();
    this.loadData();
  }

  private startClock() {
    this.interval = setInterval(() => (this.now.value = Date.now()), 1000);
  }

  async loadData() {
  try {
    const result = await this.options.fetchData();

    // unwrap AxiosResponse if it has .data, assert as T[]
    if ('data' in (result as any)) {
      this.items.value = (result as any).data as T[];
    } else {
      this.items.value = result as T[];
    }
  } catch (error) {
    logger.info('Failed to fetch data:', error);
  }
}


  addFilter(fn: (item: T) => boolean) {
    this.filters.value.push(fn);
  }

  clearFilters() {
    this.filters.value = [];
  }

  get filteredItems() {
    return computed(() => {
      let result = [...this.items.value];

      if (this.searchQuery.value) {
        const query = this.searchQuery.value.toLowerCase();
        result = result.filter((item: any) =>
          Object.values(item).some(
            (val) => val && val.toString().toLowerCase().includes(query)
          )
        );
      }

      this.filters.value.forEach((fn) => {
        result = result.filter((item: any) => fn(item as T));
      });

      return result;
    });
  }

  get sortedItems() {
    return computed(() => {
      const result = [...this.filteredItems.value];
      if (!this.sortKey.value) return result;

      return result.sort((a: any, b: any) => {
        const valA = a[this.sortKey.value!];
        const valB = b[this.sortKey.value!];

        if (valA < valB) return this.sortAsc.value ? -1 : 1;
        if (valA > valB) return this.sortAsc.value ? 1 : -1;
        return 0;
      });
    });
  }

  get totalPages() {
    return computed(() => Math.ceil(this.sortedItems.value.length / this.pageSize));
  }

  get paginatedItems() {
    return computed(() => {
      const start = (this.currentPage.value - 1) * this.pageSize;
      return this.sortedItems.value.slice(start, start + this.pageSize);
    });
  }

  nextPage() { if (this.currentPage.value < this.totalPages.value) this.currentPage.value++;}
  prevPage() { if (this.currentPage.value > 1) this.currentPage.value--;}
  toggleSort(key: SortKey) {
    if (this.sortKey.value === key) this.sortAsc.value = !this.sortAsc.value;
    else {
      this.sortKey.value = key;
      this.sortAsc.value = true;
    }
  }

  destroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
