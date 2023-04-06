<script>
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { TodoistApi } from '@doist/todoist-api-typescript'

import TimerComponent from './TimerComponent.vue'
import SpinnerComponent from './partials/SpinnerComponent.vue'
import CurrentTaskComponent from './partials/CurrentTaskComponent.vue'
import ReviewHeaderComponent from './partials/ReviewHeaderComponent.vue'

export default {
  data() {
    return {
      tasks: [],
      projects: [],
      inbox_project_id: undefined,
      current_task_idx: 0,
      complete: false,
      todoist_token: localStorage.getItem('todoist_token'),
      todoist: new TodoistApi(localStorage.getItem('todoist_token'))
    }
  },
  components: {
    CurrentTaskComponent, TimerComponent, SpinnerComponent, ReviewHeaderComponent
  },
  computed: {
    current_task() {
      return this.tasks[this.current_task_idx];
    },
  },
  emits: ['complete'],
  mounted() {
    if (this.todoist_token) {
      this.todoist.getProjects()
        .then(projects => {
          const projectIgnoreRegex = localStorage.getItem("projectIgnoreRegex")
          var projectsById = {};
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
              projectsById[projects[i].id] = projects[i].name;
          }
          this.todoist.getTasks({projectId: this.inbox_project_id})
          .then(tasks => {
            this.tasks = tasks;
            for (var i = 0; i < this.tasks.length; i++) {
              this.tasks[i].project = projectsById[this.tasks[i].projectId]
            }
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
      // Ignoring the ressponse, assuming it works for speedier UX
      this.next_task();
    },
    setContentForCurrentTask(content, old_content) {
      this.todoist.updateTask(this.current_task.id, { content: content })
        .then((isSuccess) => console.log("Set Content", isSuccess))
        .catch((error) => console.log(error));
    },
    next_task() {
      if (this.tasks.length == this.current_task_idx + 1) {
        console.log("Reviewed " + this.tasks.length + " inbox tasks.");
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
    setActionable() {
      this.current_task.actionable = true;
    },
    setInactionable() {
      this.current_task.actionable = false;
    },
    setQuick() {
      this.current_task.quick = true;
    },
    setSlow() {
      this.current_task.quick = false;
    },
  }
}
</script>

<template>
<div v-if="current_task">
  <ReviewHeaderComponent :total="tasks.length" :current_idx="current_task_idx" title="Review Inbox Tasks"/>
  <div v-if="!current_task.hasOwnProperty('actionable')">
    <q-slide-item @left="setActionable" @right="setInactionable">
      <template v-slot:left>Actionable<q-icon name="done" /></template>
      <template v-slot:right>Needs Refinement<q-icon name="alarm" /></template>
      <CurrentTaskComponent :task="current_task" prompt="Is this Actionable?"/>
      <q-popup-edit
        cover buttons persistent
        v-slot="scope"
        v-model="current_task.content"
        @save="(value, initialValue) => setContentForCurrentTask(value)">
        <q-input
          type="textarea"
          v-model="scope.value"
          @keyup.enter="scope.set"
          dense autofocus counter/>
      </q-popup-edit>
    </q-slide-item>
  </div>

  <div v-else-if="current_task.actionable">
    <div v-if="!current_task.hasOwnProperty('quick')">
      <q-slide-item @left="setQuick" @right="setSlow">
        <template v-slot:left>Under 2min<q-icon name="done" /></template>
        <template v-slot:right>Longer<q-icon name="alarm" /></template>
        <CurrentTaskComponent :task="current_task" prompt="Is this under 2 mins to complete?"/>
      </q-slide-item>
    </div>

    <div v-else-if="current_task.quick">
      <TimerComponent />
      <CurrentTaskComponent :task="current_task" prompt="Do it already!"/>
      <div class="row button-row">
        <q-btn class="q-ma-sm" color="positive" label="Done" @click="close_task()"/>
        <q-btn class="q-ma-sm" color="accent" label="Can't right now" @click="setSlow()"/>
      </div>
    </div>

    <div v-else>
      <CurrentTaskComponent :task="current_task" prompt="Is this part of a project?"/>
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

  <div v-else-if="!current_task.actionable">
    <CurrentTaskComponent :task="current_task" prompt="This isn't actionable.  Refine or close."/>
    <q-popup-edit
      cover buttons persistent
      v-slot="scope"
      v-model="current_task.content"
      @save="(value, initialValue) => setContentForCurrentTask(value)">
      <q-input
        type="textarea"
        v-model="scope.value"
        @keyup.enter="scope.set"
        dense autofocus counter/>
    </q-popup-edit>
    <div class="row button-row">
      <q-btn class="q-ma-sm" color="negative" label="Close" @click="close_task()"/>
      <q-btn class="q-ma-sm" color="negative" label="Someday, Maybe" @click="setProjectForCurrentTask('Someday')"/>
      <q-btn class="q-ma-sm" color="accent" label="Actually, actionable" @click="setActionable()"/>
    </div>
  </div>
</div>
<SpinnerComponent title="No Inbox Tasks To Review!" :completed="complete" v-else/>
</template>