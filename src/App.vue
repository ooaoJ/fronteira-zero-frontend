<template>
  <Login
    v-if="screen === 'login'"
    @login="goToLoading"
    @goRegister="goToRegister"
  />

  <Register
    v-else-if="screen === 'register'"
    @registered="goToLogin"
    @goLogin="goToLogin"
  />

  <Loading v-else-if="screen === 'loading'" @done="goToLobby" />

  <Lobby
    v-else-if="screen === 'lobby'"
    @startGame="goToGame"
    @logout="goToLogin"
  />

  <Game v-else />
</template>

<script setup>
import { ref } from 'vue'
import Login from './screens/Login.vue'
import Register from './screens/Register.vue'
import Loading from './screens/Loading.vue'
import Lobby from './screens/Lobby.vue'
import Game from './screens/Game.vue'

const screen = ref('login')

function goToLogin() {
  screen.value = 'login'
}
function goToRegister() {
  screen.value = 'register'
}
function goToLoading() {
  screen.value = 'loading'
}
function goToLobby() {
  screen.value = 'lobby'
}
function goToGame() {
  screen.value = 'game'
}
</script>