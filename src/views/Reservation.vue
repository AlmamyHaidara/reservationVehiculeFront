<script>
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';

// Import Swiper styles
import 'swiper/css';

import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import './style.css';

// import required modules
import { Autoplay, Pagination, Navigation,  Parallax,} from 'swiper/modules';

export default {
    components: {
        Swiper,
        SwiperSlide
    },
    setup() {
        return {
            modules: [Autoplay, Pagination, Navigation,Parallax]
        };
    }
};
// export default {
// data(){

// },
// methods:{

// }
// };
</script>
<template>
    <div class="reservation  h-screen">


        <h1>Reservation</h1>
        <swiper
            :speed="600"
            :parallax="true"
            :pagination="{
                clickable: true
            }"
            :spaceBetween="30"
            :centeredSlides="true"
            :autoplay="{
                delay: 2500,
                disableOnInteraction: false
            }"
            :navigation="true"
            :modules="modules"
            class="mySwiper h-screen"
        >
            <swiper-slide class="surface-600">Slide 1</swiper-slide>
            <swiper-slide class="bg-blue-200">Slide 2</swiper-slide>
            <swiper-slide class="bg-orange-500">Slide 3</swiper-slide>
            <swiper-slide class="bg-cyan-500">Slide 4</swiper-slide>
            <swiper-slide class="bg-yellow-500">Slide 5</swiper-slide>
            <swiper-slide class="bg-pink-500">Slide 6</swiper-slide>
            <swiper-slide class="bg-indigo-500">Slide 7</swiper-slide>
            <swiper-slide class="bg-teal-500">Slide 8</swiper-slide>
            <swiper-slide class="bg-bluegray-500">Slide 9</swiper-slide>
        </swiper>

    </div>
</template>

<style></style>
