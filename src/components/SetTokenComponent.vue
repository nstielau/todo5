<script>
import { TodoistApi } from '@doist/todoist-api-typescript'

export default {
  data() {
    return {
      todoist_token: "",
      error_message: ""
    }
  },
  emits: ['complete'],
  methods: {
    set_todoist_token(e) {
      if (this.todoist_token.length == 0) {
        this.error_message = "You must set a token";
        return;
      }
      var todoist = new TodoistApi(this.todoist_token);
      todoist.getTasks({filter: "today"})
        .then((tasks) => {
          console.log("Setting todoist_token to '" + this.todoist_token + "'");
          localStorage.setItem('todoist_token', this.todoist_token);
          this.$emit('complete');
        }).catch((error) => {
          e.target.classList.add('error');
          this.error_message = "Error: " + error;
        });
    },
  },
}
</script>

<template>
    <h1>Todoist token is not set.</h1>
    <p v-if="error_message" class="error">{{error_message}}</p>
    <input type="text" v-model="todoist_token">
    <br/>
    <button @click="set_todoist_token">Save token</button>
</template>

<style>
.error {
  background-color: red;
}
</style>