<template>
  <div class="chat">
    <div class="user-selection">
      <h1>Du schreibst mit: <span class="username">{{ targetUsername }}</span></h1>
      Du bist: <span class="username">{{ username }}</span>
    </div>
    <hr>
    <div class="messages">
      <div v-for="message in messages" :key="message.id" class="message" :class="{own: message.username === username}">
        <span class="text">{{ message.text }}</span>
      </div>
    </div>
    <div class="writeStatus" v-text="writeStatus"/>
    <form class="input" action="#" @submit.prevent="sendMessage">
      <input v-model="message" placeholder="Nachricht eingeben ..." @keydown="writing">
      <button type="submit">Senden</button>
    </form>
  </div>
</template>
<script>
import { v4 as uuidv4 } from 'uuid';
export default {
  name: "Chat",
  props: {
    socket: {
      type: Object,
      required: true
    },
    connected: {
      type: Boolean,
      required: true
    },
    targetUsername: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      message: "",
      messages: [],
      username: "",

      isWriting: false,
      writingTimeout: null,
      dots: "",
      lastKeyDate: new Date()
    };
  },
  mounted() {
    setInterval(() => {
      if (this.dots.length < 3) {
        this.dots += ".";
      } else {
        this.dots = ".";
      }
    }, 500);

    this.username = prompt('Please enter your username');
    if (this.username === null || this.username === undefined || this.username.trim() === '') {
      this.username = "test" + Math.floor(Math.random() * 1000);
    }
    // this.username = "test" + Math.floor(Math.random() * 1000);
    this.$emit('setUsername', this.username);

    this.socket.on('private message', ({sender, message}) => {
      if (sender === this.targetUsername || sender === this.username) { // only show messages from the selected user, otherwise the messages will be shown in the wrong chat
        console.log("Received message from server: ", message);
        this.messages.push({
          id: uuidv4(),
          username: sender,
          text: message
        });
      }
      else {
        this.$emit("newMessage", sender);
      }
    });

    this.socket.on('writing', (username) => {
      console.log("Received writing from server: ", username)
      if (username === this.targetUsername) {
        this.isWriting = true;
        clearTimeout(this.writingTimeout);
        this.writingTimeout = setTimeout(() => {
          this.isWriting = false;
        }, 2000);
      }
    });

    this.socket.on('conversation', (conversation) => { // moved to here to prevent multiple calls of loadConversation()
      console.log("Received conversation from server: ", conversation)
      try {
        if (conversation === null || conversation === undefined || conversation.length === 0) {
          return;
        }
      } catch (e) {
        return;
      }
      conversation.forEach(message => {
        console.log("Adding message to chat: ", message)
        this.messages.push({
          id: uuidv4(),
          username: message.sender,
          text: message.message
        });
      });
    })

    this.socket.emit('set username', this.username);

  },
  methods: {
    sendMessage() {
      if (this.message.trim() !== '') {
        this.socket.emit('private message', {
          sender: this.username,
          recipient: this.targetUsername,
          message: this.message.trim()
        });
        this.message = '';
      }
    },
    loadConversation() {
      this.messages = [];
      this.socket.emit('get conversation', this.conversationId);
    },
    writing() {
      if (new Date() - this.lastKeyDate > 1000) {
        this.socket.emit('writing', this.username);
        this.lastKeyDate = new Date();
      }
    }
  },
  computed: {
    conversationId() {
      return [this.username, this.targetUsername].sort().join('-');
    },
    writeStatus() {
      if (this.isWriting) {
        return this.targetUsername + " schreibt" + this.dots;
      }
      return "";
    }
  },
  watch: {
    connected() {
      if (this.connected) {
        this.socket.emit('set username', this.username);
      }
    },
    targetUsername() {
      console.log("targetUsername changed")
      this.loadConversation();
    }
  }
};
</script>
<style scoped>
input,
button {
  border: none;
  outline: none;
  background: none;
  font-size: inherit;
  font-family: inherit;
}

.spacer {
  flex: 1;
}

.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 800px;
}

.messages .message {
  display: flex;
  align-items: center;
  border-radius: 7px;
  border: 1px solid #ccc;
}
.messages .message.own {
  float: right;
  margin-left: auto;
  background-color: #1d3372;
  border: 1px solid #224fbd;
}
.message {
  padding: 5px;
  width: max-content;
}


.username {
  font-weight: bold;
  margin-right: 5px;
}

.input {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
}

.input input {
  flex: 1;
  font-size: 1em;
  padding: 0.5em;
  margin-right: 1em;
}

.input button {
  font-size: 1em;
  padding: 0.5em;
}

.writeStatus {
  background-color: hsla(0, 0%, 30%, 0.2);
  text-align: center;
  font-size: 0.8em;
  color: #ccc;
}

/*darkmode*/
@media (prefers-color-scheme: dark) {
  .chat, .input, .messages, .user-selection, input, button, .message {
    background-color: hsla(0, 0%, 30%, 0.2);
    color: white;
    border-radius: 3px;
  }
}

</style>

