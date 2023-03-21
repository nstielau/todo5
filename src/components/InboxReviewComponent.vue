<script>
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { TodoistApi } from '@doist/todoist-api-typescript'


import CurrentTaskComponent from './CurrentTaskComponent.vue'

export default {
  data() {
    return {
      inbox_tasks: [],
      projects: [],
      inbox_project_id: undefined,
      current_task_idx: 0,
      complete: false,
      todoist_token: localStorage.getItem('todoist_token'),
      todoist: new TodoistApi(localStorage.getItem('todoist_token'))
    }
  },
  components: {
    CurrentTaskComponent
  },
  computed: {
    current_task() {
      return this.inbox_tasks[this.current_task_idx];
    },
    isRecurring() {
      return (this.current_task.due && this.current_task.due.isRecurring);
    },
    progress() {
      return (this.current_task_idx+1)/this.inbox_tasks.length*100;
    },
  },
  emits: ['complete'],
  mounted() {
    if (this.todoist_token) {
      this.todoist.getProjects()
        .then(projects => {
          const projectIgnoreRegex = localStorage.getItem("projectIgnoreRegex")
          for (var i = 0; i < projects.length; i++) {
              // Add top level projects
              if (projects[i].parentId == null) {
                if (!projects[i].name.match(projectIgnoreRegex)) {
                  this.projects.push(projects[i]);
                }
              }
              if (projects[i].isInboxProject) {
                this.inbox_project_id = projects[i].id;
              }
          }

          this.todoist.getTasks({projectId: this.inbox_project_id})
          .then(inbox_tasks => {
            this.inbox_tasks = inbox_tasks;
            if(!this.current_task) {
              console.log("No Inbox tasks to review");
              this.complete = true;
              setTimeout(() => this.$emit('complete'), 1000);
            }
          }).catch(error => { console.log(error)
        });
      }).catch(error => { console.log(error)})
    }
  },
  methods: {
    setProjectForCurrentTask(project) {
      console.log("Selected project " + project.name + " for Inbox task ID ÷" + this.current_task.id);
      axios.request('https://api.todoist.com/sync/v9/sync', {
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + this.todoist_token},
        data: {commands: JSON.stringify([{
          "type": "item_move",
          "uuid": uuidv4(),
          "args": {"id": this.current_task.id, "project_id": project.id}}])}
      })
      .then(response => console.log("Successfully set project"))
      .catch(error => console.log(error));
      // Ignoring the response, assuming it works for speedier UX
      this.next_task();
    },
    next_task() {
      if (this.inbox_tasks.length == this.current_task_idx + 1) {
        console.log("Reviewed " + this.inbox_tasks.length + " inbox tasks.");
        this.$emit('complete');
      }
      this.current_task_idx = this.current_task_idx + 1;
    },
    close_task() {
      var todoist = new TodoistApi(localStorage.getItem('todoist_token'));
      todoist.closeTask(this.current_task.id).catch((error) => console.log(error))
      // Assume API call completes for speedy UX
      this.next_task();
    },
    findProjectNameById(project_id) {
      console.log("Finding name for project " + project_id)
      for (var i = 0; i < this.projects.length; i++) {
        if (this.projects[i].id == project_id) {
          return this.projects[i].name;
        }
      }
      return undefined;
    },
  }
}
</script>

<template>
<div v-if="current_task">
  <div class="row">
    <div class="col-9">
    <h1>
      Review Inbox Tasks
      <small>{{inbox_tasks.length}} Inbox Tasks</small>
    </h1>
    </div>
    <div class="col">
      <q-circular-progress
        show-value
        reverse
        :value="progress"
        size="75px"
        :thickness="0.6"
        font-size="15px"
        color="accent"
        center-color="grey-9"
        class="q-ma-md"
      >{{current_task_idx+1}}/{{inbox_tasks.length}}
    </q-circular-progress>
    </div>
  

    <div class="row q-mb-md" id="current_task">
      <div class="col-12">
        <CurrentTaskComponent 
          :content="current_task.content"
          :isRecurring="isRecurring"
          :project="findProjectNameById(current_task.projectId)"/>
      </div>
    </div>

    <div class="row button-row">
      <q-btn class="q-ma-sm"
             v-for="project in projects"
             :key="project.id"
             color="primary"
             :style="{backgroundColor: project.color + ' !important'}"
             :label="project.name"
             @click="setProjectForCurrentTask(project)"/>
      <q-btn class="q-ma-sm" color="positive" label="Done" @click="close_task()"/>
      <p class="hint">Hint: change order and color in todoist app</p>
    </div>
  </div>
</div>
<div id="spinner" class="row fixed-center" style="justify-content:center;height:300px;width:300px;" v-else>
  <div class="col"></div>
  <div class="col-6"> 
    <q-spinner-gears size="100px" color="accent" />
    <div v-if="complete">No Inbox Tasks To Review!</div><div v-else class="invisible"></div>
  </div>
  <div class="col"></div>
</div>
</template>