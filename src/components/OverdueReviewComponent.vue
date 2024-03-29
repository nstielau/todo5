<script>
import { TodoistApi } from '@doist/todoist-api-typescript'

import SpinnerComponent from './partials/SpinnerComponent.vue'
import CurrentTaskComponent from './partials/CurrentTaskComponent.vue'
import ReviewHeaderComponent from './partials/ReviewHeaderComponent.vue'

export default {
  data() {
    return {
      tasks: [],
      projects: [],
      complete: false,
      current_task_idx: 0
    }
  },
  components: {
    CurrentTaskComponent, SpinnerComponent, ReviewHeaderComponent
  },
  computed: {
    current_task() {
      return this.tasks[this.current_task_idx];
    },
    progress() {
      return (this.current_task_idx+1)/this.tasks.length*100;
    }
  },
  mounted() {
    var todoist = new TodoistApi(localStorage.getItem('todoist_token'));
    var projectsById = {};
    todoist.getProjects()
      .then((projects) => {
        this.projects = projects;
        for (var i = 0; i < projects.length; i++) {
          projectsById[projects[i].id] = projects[i].name;
        }
      }).catch((error) => console.log(error))
    todoist.getTasks({filter: "overdue"})
      .then((tasks) => {
        this.tasks = tasks;
        for (var i = 0; i < this.tasks.length; i++) {
          this.tasks[i].project = projectsById[this.tasks[i].projectId]
        }
        if (!this.current_task) {
          console.log("No overdue tasks to review.");
          this.complete = true;
          setTimeout(() => this.$emit('complete'), 1000);
        }
      }).catch((error) => console.log(error))
  },
  emits: ['complete'],
  methods: {
    set_due_date(due_string) {
      const task_id = this.current_task.id;
      var todoist = new TodoistApi(localStorage.getItem('todoist_token'));
      todoist.updateTask(this.current_task.id, { due_string: due_string })
          .then((isSuccess) => {
            this.next_task();
            todoist.addComment({
                taskId: this.task_id,
                content: "Rescheduled from " + new Date().toISOString().split('T')[0],
            }).catch((error) => console.log(error))
          }).catch((error) => console.log(error))
    },
    close_task() {
      var todoist = new TodoistApi(localStorage.getItem('todoist_token'));
      todoist.closeTask(this.current_task.id).catch((error) => console.log(error))
      // Assume API call completes for speedy UX
      this.next_task();
    },
    next_task() {
      if (this.tasks.length == this.current_task_idx + 1) {
        console.log("Reviewed " + this.tasks.length + " overdue tasks.");
        this.$emit('complete');
      }
      this.current_task_idx = this.current_task_idx + 1;
    },
  }
}
</script>

<template>
<div v-if="current_task">
  <ReviewHeaderComponent :total="tasks.length" :current_idx="current_task_idx" title="Review Overdue Tasks"/>
  <CurrentTaskComponent :task="current_task" prompt="When should we do this?"/>
  <div>
    <div class="row q-py-md button-row">
      <q-btn color="primary" label="Do today" @click="set_due_date('today')"/>
      <q-btn color="primary" label="Do next week" @click="set_due_date('next week')"/>
      <q-btn color="primary" label="In 7 days" @click="set_due_date('in 7 days')"/>
    </div>
    <div class="row q-py-md button-row">
      <q-btn color="positive" label="Done" @click="close_task()"/>
      <q-btn color="warning" label="Ack All" @click="$emit('complete')"/>
    </div>
  </div>
</div>
<SpinnerComponent title="No Overdue Tasks To Review!" :completed="complete" v-else/>
</template>
