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
        name.value = me.name
        email.value = me.email
        avatarId.value = me.avatarId
    } catch (e) {
        error.value = e?.response?.data?.message || e.message
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
            avatarId: avatarId.value
        })
        success.value = 'Perfil atualizado!'
    } catch (e) {
        error.value = e?.response?.data?.message || e.message
    }
}

async function changePass() {
    error.value = ''
    success.value = ''
    try {
        await changePassword({
            currentPassword: currentPassword.value,
            newPassword: newPassword.value
        })
        currentPassword.value = ''
        newPassword.value = ''
        success.value = 'Senha alterada!'
    } catch (e) {
        error.value = e?.response?.data?.message || e.message
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
        error.value = e?.response?.data?.message || e.message
    }
}
</script>

<template>
    <div class="profile">
        <h1>Perfil</h1>

        <p v-if="loading">Carregando...</p>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <div v-if="!loading" class="box">
            <h3>Informações</h3>

            <label>Nome</label>
            <input v-model="name" />

            <label>Email</label>
            <input v-model="email" />

            <button @click="saveProfile">Salvar</button>
        </div>

        <div class="box">
            <h3>Avatar</h3>

            <div class="avatars">
                <img v-for="a in avatars" :key="a.id" :src="a.src" :class="{ active: a.id === avatarId }"
                    @click="selectAvatar(a.id)" />
            </div>
        </div>

        <div class="box">
            <h3>Senha</h3>

            <label>Senha atual</label>
            <input type="password" v-model="currentPassword" />

            <label>Nova senha</label>
            <input type="password" v-model="newPassword" />

            <button @click="changePass">Alterar senha</button>
        </div>
    </div>
</template>

<style scoped>
.profile {
    padding: 20px;
    color: white;
}

.box {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #333;
    border-radius: 10px;
}

input {
    display: block;
    width: 100%;
    margin: 8px 0;
    padding: 8px;
}

.avatars {
    display: flex;
    gap: 10px;
}

.avatars img {
    width: 80px;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 10px;
}

.avatars img.active {
    border-color: orange;
}

.error {
    color: red;
}

.success {
    color: green;
}
</style>