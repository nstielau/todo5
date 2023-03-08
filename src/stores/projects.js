// stores/projects.js
import { defineStore } from 'pinia'

export const useProjectsStore = defineStore('projects', {
  state: () => {
    return { 
      projects: []
    }
  },
  getters: {
    inboxProject: (state) {
      return state.count * 2;
    },
  },  
  actions: {
    load(projects) {
      this.projects = projects;
    },
  },
})