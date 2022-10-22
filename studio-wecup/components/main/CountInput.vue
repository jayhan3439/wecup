<style lang="less" scoped>
  .number-count-input-container {
    width: 100%;
    // height: 44px;
    padding: 17px 24px;
    display: flex;
    align-items: center;
    background-color: #F5F8FA;
    .input {
      flex: 1;
      margin-right: 10px;
      border: none;
      background-color: #F5F8FA;
      &::placeholder {
        color: #C0CFD9;
      }
      &:focus {
        outline: none;
      }
    }
    .count {
      position: absolute;
      right: 24px;
      color: #2D96DE;
    }
  }
</style>
<template lang="pug">
  .number-count-input-container
    input.input.body2-regular(
      :value="value"
      @input="$emit('input', $event.target.value)"
      :placeholder="placeholder"
    )
    .count.body2-regular {{ countDown | countFilter }}
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  mounted() {
    this.timeOut();
  },
  filters: {
    countFilter(val) {
      const minute = Math.floor(val / 60);
      const second = val % 60;
      if (second > 9) {
        return `0${minute}:${second}`;
      }
      return `0${minute}:0${second}`;
    },
  },
  data() {
    return {
      countDown: 180,
    };
  },
  methods: {
    timeOut() {
      setTimeout(() => {
        this.countDown -= 1;
        if (this.countDown !== 0) {
          this.timeOut();
        } else {
          this.$emit('timeOver');
        }
      }, 1000);
    },
  },
};
</script>
