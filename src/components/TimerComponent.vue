<template>
  <div class="row button-row">
    <div class="col"></div>
    <div class="col-4"><h2>{{min}}:{{sec}}</h2></div>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  props : {
    endDate : {  // pass date object till when you want to run the timer
      type : Date,
      default(){
        return new Date()
      }
    },
    negative : {  // optional, should countdown after 0 to negative
      type : Boolean,
      default : true
    }
  },
  data(){
    return{
      now : new Date(),
      timer : null
    }
  },
  computed:{
    hour(){

      let h = Math.abs(Math.trunc((this.endDate - this.now) / 1000 / 3600));
      return h>9?h:''+h;
    },
    min(){
      let m = Math.abs(Math.trunc((this.endDate - this.now) / 1000 / 60) % 60);
      return m>9?m:''+m;
    },
    sec(){
      let s = Math.abs(Math.trunc((this.endDate - this.now)/1000) % 60)
      return s>9?s:'0'+s;
    }
  },
  watch : {
    endDate : {
      immediate : true,
      handler(newVal){
        if(this.timer){
          clearInterval(this.timer)
        }
        this.timer = setInterval(()=>{
          this.now = new Date()
          if(this.negative)
            return
          if(this.now > newVal){
            this.now = newVal
            this.$emit('endTime')
            clearInterval(this.timer)
          }
        }, 1000)
      }
    }
  },
  beforeDestroy(){
    clearInterval(this.timer)
  }
}
</script>