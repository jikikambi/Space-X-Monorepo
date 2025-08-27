<script lang="ts" setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useLaunchDetails } from "./LaunchDetails"; 

const { launch, rocket, launchpad, goBack, getYouTubeId } = useLaunchDetails();
</script>

<template>
  <div v-if="launch" class="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-8">

    <!-- Mission Header + Patch -->
    <div class="flex flex-col md:flex-row gap-6 items-center">
      <div v-if="launch.links?.patch?.large" class="flex-shrink-0">
        <img :src="launch.links.patch.large" alt="Mission Patch"
             class="w-32 h-32 object-contain rounded-xl shadow"/>
      </div>
      <div>
        <h2 class="text-3xl text-gray-500 font-bold mb-2">{{ launch.name }}</h2>
        <p class="text-gray-500">{{ new Date(launch.date_utc).toLocaleString() }}</p>
        <p class="font-medium mt-1"
           :class="launch.upcoming ? 'text-blue-600' : launch.success ? 'text-green-600' : 'text-red-600'">
          {{ launch.upcoming ? "Upcoming" : launch.success ? "Success" : "Failed" }}
        </p>
      </div>
    </div>

    <!-- Rocket + Launchpad + Telemetry -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-gray-500">

      <!-- Rocket Info -->
      <div class="bg-gray-50 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg text-gray-500 font-semibold mb-2">🚀 Rocket</h3>
        <p><span class="font-medium">Name:</span> {{ rocket?.name || "N/A" }}</p>
        <p><span class="font-medium">Type:</span> {{ rocket?.type || "N/A" }}</p>
      </div>

      <!-- Launchpad Info -->
      <div class="bg-gray-50 text-gray-500 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg text-gray-500 font-semibold mb-2">📍 Launchpad</h3>
        <p><span class="font-medium">Name:</span> {{ launchpad?.full_name || "N/A" }}</p>
        <p><span class="font-medium">Region:</span> {{ launchpad?.region || "N/A" }}</p>
      </div>

      <!-- Telemetry / Flight Club -->
      <div v-if="launch.telemetry?.flight_club" class="bg-gray-50 text-gray-500 rounded-xl p-4 shadow-sm">
        <h3 class="text-lg font-semibold mb-2 text-gray-500">📡 Telemetry</h3>
        <a :href="launch.telemetry.flight_club" target="_blank" class="text-blue-600 hover:underline">
          View Flight Club
        </a>
      </div>
    </div>

    <!-- Mission Details -->
    <div>
      <h3 class="text-xl font-semibold text-gray-500 mb-2">Mission Details</h3>
      <p class="whitespace-pre-wrap text-gray-500">{{ launch.details || "No details available" }}</p>
    </div>

    <!-- Flickr Carousel -->
    <div v-if="launch.links?.flickr?.original?.length" class="space-y-4">
      <h4 class="text-md font-semibold text-gray-500">📸 Launch Photos</h4>
      <Swiper
        :modules="[Navigation, Pagination, Autoplay]"
        :slides-per-view="1"
        :space-between="20"
        navigation
        pagination
        :loop="true"
        :autoplay="{ delay: 4000, disableOnInteraction: false }"
        class="rounded-xl shadow-lg"
      >
        <SwiperSlide v-for="(img, i) in launch.links.flickr.original" :key="i" class="flex justify-center">
          <img :src="img" alt="Launch Photo" class="max-h-[500px] object-contain rounded-xl" />
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- YouTube Video -->
    <div v-if="getYouTubeId(launch.links?.webcast)" class="aspect-w-16 aspect-h-9">
      <iframe
        class="w-full h-96 rounded-lg"
        :src="`https://www.youtube.com/embed/${getYouTubeId(launch.links?.webcast)}`"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

    <!-- External Links -->
    <div class="flex flex-wrap gap-3 mb-6 justify-center">
      <a v-if="launch.links?.wikipedia" :href="launch.links.wikipedia" target="_blank"
         class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Wikipedia
      </a>
      <a v-if="launch.links?.article" :href="launch.links.article" target="_blank"
         class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Article
      </a>
      <a v-if="launch.links?.presskit" :href="launch.links.presskit" target="_blank"
         class="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
        Presskit
      </a>
      <a v-if="launch.links?.reddit?.launch" :href="launch.links.reddit.launch" target="_blank"
         class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">
        Reddit Thread
      </a>
    </div>

    <!-- Back Button -->
    <div class="flex justify-center">
      <button @click="goBack" class="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
        Back
      </button>
    </div>

  </div>

  <div v-else class="text-center text-gray-800">
    Loading launch details...
  </div>
</template>
