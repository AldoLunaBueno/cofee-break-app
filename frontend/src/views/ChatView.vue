<template>
  <div id="chat">
    <ul>
      <li v-for="message in messages" :key="message.id">
        {{ message.content }}
      </li>
    </ul>
    <form @submit.prevent="sendMessage">
      <textarea v-model="newMessage" placeholder="Type a message"></textarea>
      <button type="submit"></button>
    </form>
  </div>
</template>

<script type="module">
import { io } from 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.esm.min.js'

export default {
  name: 'ChatView',
  data() {
    return {
      messages: [],
      newMessage: '',
      socket: null,
    }
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim()) {
        this.socket.emit('chat message', this.newMessage.trim())
        this.newMessage = ''
      }
    },
  },
  mounted() {
    this.socket = io("http://localhost:3000", {
      auth: {
        serverOffset: 0,
      },
    })
    this.socket.on('chat message', (content, serverOffset) => {
      this.messages.push({
        id: serverOffset,
        content,
      })
      this.socket.auth.serverOffset = serverOffset
    })
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect()
    }
  },
}
</script>

<style scoped>
#chat {
  height: 100%;
  width: 350px;
  display: flex;
  flex-direction: column;
  border: 1px solid #bbb;
  color: #bbb;
  border-radius: 4px;
  padding: 10px;
  background-color: #111;

  ul {
    flex-grow: 1;
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;

    li {
      padding: 0.5rem 1rem;

      &:nth-child(odd) {
        background-color: #333;
      }

      &:nth-child(even) {
        display: flex;
        justify-content: end;
      }
    }
  }

  form {
    display: flex;
    gap: 10px;
    height: 40px;

    textarea {
      flex-grow: 1;
      height: 40px;
      background-color: #333;
      border: 1px solid #bbb;
      border-radius: 20px;
      color: #bbb;
      padding: 8px 10px;
      resize: none;
      overflow: hidden;
    }

    button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid #bbb;
      background-color: #090;
    }
  }
}
</style>
