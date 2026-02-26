<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const tips = [
  'Preparando assentamento, checando rotas, ouvindo o rádio...',
  'Contando munição e distribuindo suprimentos...',
  'Reforçando as paliçadas e apagando rastros...',
  'Sintonizando transmissões de emergência...',
  'Analisando barulho na região... pode ter horda vindo.',
  'Carregando mapas e pontos de interesse...'
]

const currentTip = ref(tips[0])

let tipTimer = null
let doneTimer = null

function pickNextTip() {
  let next = currentTip.value
  while (next === currentTip.value) {
    next = tips[Math.floor(Math.random() * tips.length)]
  }
  currentTip.value = next
}

onMounted(() => {
  tipTimer = setInterval(pickNextTip, 1400)
  doneTimer = setTimeout(() => {
    router.push('/lobby')
  }, 5000)
})

onBeforeUnmount(() => {
  if (tipTimer) clearInterval(tipTimer)
  if (doneTimer) clearTimeout(doneTimer)
})
</script>
<template>
  <div class="loading-bg">
    <div class="overlay"></div>

    <div class="panel">
      <p class="title">Carregando...</p>
      <p class="tip">{{ currentTip }}</p>

      <div class="bar">
        <div class="fill"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-bg {
  width: 100%;
  height: 100vh;

  background: #0b0f14;
  background-image: url('../assets/images/loading.png');
  background-size: cover;
  background-position: center;

  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.9));
}

.panel {
  position: absolute;
  z-index: 1;
  bottom: 15px;
  left: 10px;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 14px;
}

.title {
  margin: 0;
  font-size: 22px;
  color: #fde6c3;
  letter-spacing: 1px;
}

.bar {
  width: 99%;
  height: 14px;
  border: 1px solid rgba(250, 230, 185, 0.18);
  background: rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.fill {
  height: 100%;
  width: 45%;
  background: #c46a22;
  animation: loading 1.2s infinite ease-in-out;
}

.tip {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 235, 215, 0.7);
}

@keyframes loading {
  0% { transform: translateX(-120%); width: 40%; }
  50% { width: 70%; }
  100% { transform: translateX(260%); width: 40%; }
}
</style>
