<template>
  <div class="lobby">
    <div class="topbar"></div>

    <div class="content">
      <div class="left">
        <h2>Perfil</h2>
        <p>Seu nível, conquistas, etc.</p>
      </div>

      <div class="right">
        <h2>Pronto pra uma nova batalha?</h2>
        <button class="btn" @click="$emit('startGame')">NOVA PARTIDA</button>
        <button class="btn2" @click="$emit('logout')">SAIR</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['startGame', 'logout'])
</script>

<style scoped>
.lobby {
  width: 100vw;
  height: 100vh;
  background: #0b0f14;
  color: white;
}

.topbar {
  height: 80px;
  background-image: url('../assets/ui/top-bar.png'); /* quando você colocar */
  background-size: cover;
  background-position: center;
}

.content {
  padding: 20px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.left, .right {
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(250, 230, 185, 0.18);
  padding: 18px;
}

.btn {
  width: 100%;
  height: 52px;
  background: #c46a22;
  border: none;
  color: white;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
}

.btn2 {
  width: 100%;
  height: 44px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  margin-top: 10px;
}
</style>
