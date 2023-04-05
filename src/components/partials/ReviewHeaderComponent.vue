<template>
  <div class="row">
    <div class="col-9">
    <h1>
      {{title}}
      <small>{{total}} Tasks</small>
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
      >{{current_idx+1}}/{{total}}
    </q-circular-progress>
    </div>
  </div>
</template>

<script>
export default {
  props : ['current_idx', 'total', 'title'],
  computed: {
    progress() {
      return (this.current_idx+1)/this.total*100;
    },
  },
}
</script>