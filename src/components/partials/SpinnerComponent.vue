<template>
  <div id="spinner" class="row fixed-center" style="width:100%;">
    <div class="col"></div>
    <div class="col-3">
      <q-spinner-gears size="100px" color="accent" />
      <div v-if="completed">{{title}}</div><div v-else class="invisible"></div>
    </div>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  props : ['completed', 'title'],
  data(){
    return{
      timer : null
    }
  },
}
</script>