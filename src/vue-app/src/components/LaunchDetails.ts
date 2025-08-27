import type { Launch } from "@space-x/shared/Launch";
import type { Rocket } from "@space-x/shared/Rocket";
import type { Launchpad } from "@space-x/shared/Launchpad";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchLaunch, fetchRocket, fetchLaunchpad } from "../services/api";

export function useLaunchDetails() {
  const launch = ref<Launch | null>(null);
  const rocket = ref<Rocket | null>(null);
  const launchpad = ref<Launchpad | null>(null);
  const route = useRoute();
  const router = useRouter();

  // Extract YouTube ID
  const getYouTubeId = (url?: string | null) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const loadLaunchDetails = async () => {
    const id = route.params.id as string;

    // Fetch launch
    const res = await fetchLaunch(id);
    launch.value = res.data;

    // Fetch rocket
    if (launch.value?.rocket) {
      const rocketRes = await fetchRocket(launch.value.rocket);
      rocket.value = rocketRes.data;
    }

    // Fetch launchpad
    if (launch.value?.launchpad) {
      const padRes = await fetchLaunchpad(launch.value.launchpad);
      launchpad.value = padRes.data;
    }
  };

  onMounted(loadLaunchDetails);

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