<script setup>
import { ref, onMounted } from 'vue'
import { getMe, updateMe, changePassword } from '../services/profile'

import c1 from '../assets/images/profiles/character1.png'
import c2 from '../assets/images/profiles/character2.png'
import c3 from '../assets/images/profiles/character3.png'
import c4 from '../assets/images/profiles/character4.png'
import c5 from '../assets/images/profiles/character5.png'

const avatars = [
  { id: 1, src: c1 },
  { id: 2, src: c2 },
  { id: 3, src: c3 },
  { id: 4, src: c4 },
  { id: 5, src: c5 },
]

const loading = ref(true)
const error = ref('')
const success = ref('')

const name = ref('')
const email = ref('')
const avatarId = ref(1)

const currentPassword = ref('')
const newPassword = ref('')

onMounted(async () => {
  try {
    const me = await getMe()
    name.value = me?.name ?? ''
    email.value = me?.email ?? ''
    avatarId.value = Number(me?.avatarId) || 1
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || String(e)
  } finally {
    loading.value = false
  }
})

async function saveProfile() {
  error.value = ''
  success.value = ''
  try {
    await updateMe({
      name: name.value,
      email: email.value,
      avatarId: avatarId.value,
    })
    success.value = 'Perfil atualizado!'
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || String(e)
  }
}

async function changePass() {
  error.value = ''
  success.value = ''
  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    currentPassword.value = ''
    newPassword.value = ''
    success.value = 'Senha alterada!'
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || String(e)
  }
}

async function selectAvatar(id) {
  error.value = ''
  success.value = ''
  try {
    avatarId.value = id
    await updateMe({ avatarId: id })
    success.value = 'Avatar atualizado!'
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || String(e)
  }
}
</script>

<template>
  <div class="profile-bg">
    <div class="overlay"></div>

    <div class="metal-panel">
      <div class="panel-content">
        <div class="header">
          <div>
            <h1 class="title">PERFIL</h1>
            <p class="subtitle">Gerencie seu sobrevivente</p>
          </div>

          <button class="btn-ghost small-btn" @click="$router.push('/lobby')">
            VOLTAR
          </button>
        </div>

        <p v-if="loading" class="state">Carregando...</p>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <div v-if="!loading" class="grid">
          <!-- INFORMAÇÕES -->
          <div class="card">
            <h3>Informações</h3>

            <label>Nome</label>
            <input v-model="name" />

            <label>Email</label>
            <input v-model="email" />

            <button class="btn-rust small-btn" @click="saveProfile">
              SALVAR
            </button>
          </div>

          <!-- AVATAR -->
          <div class="card">
            <h3>Avatar</h3>

            <div class="avatars">
              <img
                v-for="a in avatars"
                :key="a.id"
                :src="a.src"
                :class="{ active: a.id === avatarId }"
                @click="selectAvatar(a.id)"
                alt=""
              />
            </div>
          </div>

          <!-- SENHA -->
          <div class="card">
            <h3>Senha</h3>

            <label>Senha atual</label>
            <input type="password" v-model="currentPassword"/>

            <label>Nova senha</label>
            <input type="password" v-model="newPassword"/>

            <button class="btn-rust small-btn" @click="changePass">
              ALTERAR
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-bg {
  width: 100vw;
  height: 100vh;

  background-image: url('../assets/images/backgrounds/profile.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    900px 520px at 22% 18%,
    rgba(0, 0, 0, 0.08),
    rgba(0, 0, 0, 0.75)
  );
  z-index: 1;
}

.metal-panel {
  position: relative;
  z-index: 2;

  width: min(1100px, 94vw);
  max-height: min(86vh, 720px);
  overflow: auto;

  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(250, 230, 185, 0.22);

  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.60),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);

  backdrop-filter: blur(8px);

  padding: 28px;
}

.panel-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.title {
  margin: 0;
  font-size: 34px;
  letter-spacing: 2px;
  color: rgba(255, 235, 215, 0.92);
  text-transform: uppercase;
}

.subtitle {
  margin: 6px 0 0;
  color: #fde6c3;
  opacity: 0.9;
}

.state {
  color: rgba(255, 255, 255, 0.78);
}

.error {
  color: #ff7b7b;
  margin: 8px 0 0;
}

.success {
  color: #3bd16f;
  margin: 8px 0 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(250, 230, 185, 0.18);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  padding: 18px;
}

.card h3 {
  margin: 0 0 12px;
  font-size: 20px;
  letter-spacing: 1px;
  color: rgba(255, 235, 215, 0.92);
}

label {
  display: block;
  margin-top: 10px;
  font-weight: 700;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.85);
}

input {
  display: block;
  width: 96%;
  margin-top: 8px;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.40);
  color: #fff;
  outline: none;
}

input:focus {
  border-color: rgba(255, 190, 120, 0.35);
  box-shadow: 0 0 0 3px rgba(255, 190, 120, 0.10);
}

.avatars {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.avatars img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;

  border: 2px solid transparent;
  border-radius: 14px;

  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.45);
  transition: transform 0.12s ease, filter 0.12s ease, border-color 0.12s ease;
}

.avatars img:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.avatars img.active {
  border-color: #ffffff;
}

.avatars img.active:before{
    content: "oi";
    position: relative;
    top: 20px;
}

.btn-rust {
  height: 56px;
  padding: 0 16px;
  margin-top: 14px;
  position: relative;

  background-color: #b85e1a;
  background-image:
    url('../assets/images/texture/black-felt.png'),
    linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.35));

  background-size: cover, 100% 100%;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;

  border: 2px solid rgba(10, 10, 10, 0.9);

  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -2px 0 rgba(0, 0, 0, 0.45);

  color: rgba(255, 235, 215, 0.92);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;

  transition: transform 0.12s ease, filter 0.12s ease;
}

.btn-rust:hover {
  filter: brightness(1.08) contrast(1.05);
  transform: translateY(-1px);
}

.btn-rust:active {
  transform: translateY(1px);
}

.btn-ghost {
  height: 56px;
  padding: 0 16px;
  position: relative;

  background-color: rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(10, 10, 10, 0.9);

  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    inset 0 -2px 0 rgba(0, 0, 0, 0.35);

  color: rgba(255, 235, 215, 0.92);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;

  transition: transform 0.12s ease, filter 0.12s ease;
}

.btn-ghost:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.btn-ghost:active {
  transform: translateY(1px);
}

.small-btn {
  height: 44px;
  font-size: 14px;
  padding: 0 14px;
}
</style>