import type { Launch } from "@space-x/shared/Launch";
import type { Rocket } from "@space-x/shared/Rocket";
import type { Launchpad } from "@space-x/shared/Launchpad";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchLaunch, fetchRocket, fetchLaunchpad } from "../services/api";
import { logger } from "@space-x/shared/logger";

export function useLaunchDetails() {
  const launch = ref<Launch | null>(null);
  const rocket = ref<Rocket | null>(null);
  const launchpad = ref<Launchpad | null>(null);
  const route = useRoute();
  const router = useRouter();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Extract YouTube ID helper
  const getYouTubeId = (url?: string | null) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Load launch and related entities
  const loadLaunchDetails = async () => {
    const id = route.params.id as string;

    try {
      const res = await fetchLaunch(id);
      launch.value = res.data;

      if (launch.value?.rocket) {
        const rocketRes = await fetchRocket(launch.value.rocket);
        rocket.value = rocketRes.data;
      }

      if (launch.value?.launchpad) {
        const padRes = await fetchLaunchpad(launch.value.launchpad);
        launchpad.value = padRes.data;
      }
    } catch (err) {
      logger.error(`[Vue] Failed to load launch details for ${route.params.id}`, err);
    }
  };

  onMounted(loadLaunchDetails);

  // Watch selected launch and publish only the launch ID for backend enrichment
  watch(
    () => launch.value?.id,
    async (launchId) => {
      if (!launchId) return;

      try {
        await fetch(`${API_BASE}/launches/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "ENRICH_LAUNCH", payload: { id: launchId } }),
        });
        logger.info(`[Vue] ENRICH_LAUNCH event published for launch ${launchId}`);
      } catch (err) {
        logger.error(`[Vue] Failed to publish ENRICH_LAUNCH for ${launchId}`, err);
      }
    },
    { immediate: true }
  );

  const goBack = () => router.back();

  return {
    launch,
    rocket,
    launchpad,
    loadLaunchDetails,
    getYouTubeId,
    goBack,
  };
}
