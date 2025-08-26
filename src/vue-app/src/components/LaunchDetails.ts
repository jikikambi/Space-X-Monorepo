import type { Launch } from "@space-x/shared/Launch";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchLaunch } from "../services/api";

export function launchDetails() {
  const launch = ref<Launch | null>(null);
  const route = useRoute();
  const router = useRouter();

  onMounted(async () => {
    const id = route.params.id as string;
    const res = await fetchLaunch(id);

    // Map API response safely to include missing nested details
    const data = res.data;
    launch.value = {
      ...data,
      rocket: data.rocket || { rocket_id: "", rocket_name: "N/A", rocket_type: "N/A" },
      launch_site: data.launch_site || { site_id: "N/A", site_name: "N/A", site_name_long: "N/A" },
      links: data.links || {},
      telemetry: data.telemetry || {}
    };
  });

  function goBack() {
    router.back();
  }

  function getYouTubeId(url: string | undefined) {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  return {
    launch,
    goBack,
    getYouTubeId
  };
}
