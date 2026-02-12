<template>
  <Login v-if="screen === 'login'" @login="goToLoading" />
  <Loading v-else-if="screen === 'loading'" />
  <Game v-else />
</template>

<script setup>
import { ref } from 'vue'
import Login from './screens/Login.vue'
import Loading from './screens/Loading.vue'
import Game from './screens/Game.vue'

const screen = ref('login')

function goToLoading() {
  screen.value = 'loading'

  // simula carregamento (no futuro: esperar resposta da API)
  setTimeout(() => {
    screen.value = 'game'
  }, 10000)
}
</script>
