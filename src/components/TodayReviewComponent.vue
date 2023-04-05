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
      current_task_idx: 0,
      complete: false,
      todoist: new TodoistApi(localStorage.getItem('todoist_token'))
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
    var projectsById = {};
    this.todoist.getProjects()
      .then((projects) => {
        this.projects = projects;
        for (var i = 0; i < this.projects.length; i++) {
          projectsById[projects[i].id] = projects[i].name;
        }
      }).catch((error) => console.log(error))
    this.todoist.getTasks({filter: "today"})
        .then((tasks) => {
          this.tasks = tasks;
          for (var i = 0; i < this.tasks.length; i++) {
            console.log("TODO: why isn't project setting here?")
            this.tasks[i].project = projectsById[this.tasks[i].projectId]
          }

          if (!this.current_task) {
            console.log("No Today tasks to review");
            this.complete = true;
            setTimeout(() => this.$emit('complete'), 1000);
          }
        }).catch((error) => console.log(error))
  },
  emits: ['complete'],
  methods: {
    set_due_date(due_string) {
      const task_id = this.current_task.id;
      this.todoist.updateTask(this.current_task.id, { due_string: due_string })
        .then((isSuccess) => {
          this.todoist.addComment({
              taskId: task_id,
              content: "Rescheduled from " + new Date().toISOString().split('T')[0],
          });
        })
        .catch((error) => console.log(error))
      // Assume API call completes for UX
      this.next_task();
    },
    close_task() {
      this.todoist.closeTask(this.current_task.id)
        .then((isSuccess) => {
          console.log(isSuccess)
          this.next_task();
        }).catch((error) => console.log(error))
    },
    next_task() {
      if (this.tasks.length - 1 == this.current_task_idx) {
        this.$emit('complete');
      }
      this.current_task_idx = this.current_task_idx + 1
    },
  }
}
</script>

<template>
<div v-if="current_task">
  <ReviewHeaderComponent :total="tasks.length" :current_idx="current_task_idx" title="Review Today's Tasks"/>

  <div class="row q-mb-md" id="current_task">
    <div class="col-12">
      <p>Are we gonna get to it today?</p>
      <CurrentTaskComponent :task="current_task" />
    </div>
  </div>
  <div class="col-12">
    <div class="row q-py-md button-row">
      <q-btn color="primary" label="Do today" @click="this.next_task"/>
      <q-btn color="primary" label="Do tomorrow" @click="set_due_date('tomorrow')"/>
    </div>
    <div class="row q-py-md button-row">
      <q-btn color="primary" label="Do next week" @click="set_due_date('next week')"/>
      <q-btn color="primary" label="In 7 days" @click="set_due_date('in 7 days')"/>
    </div>
    <div class="row q-py-md button-row">
      <q-btn color="positive" label="Done" @click="close_task()"/>
      <q-btn color="warning" label="Ack All" @click="$emit('complete')"/>
    </div>
  </div>
</div>
<SpinnerComponent title="No Today Tasks To Review!" completed="complete" v-else/>
</template>
