<style lang="less" scoped>
  .pin-code-wrap {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background-image: url('~@/assets/login-bg.png');
    background-size: cover;
    background-position: center;
    background-color: #DEF0FF;
  }
  .header-nav {
    margin-bottom: 20px;
    text-align: center;
  }
  .login-box {
    box-sizing: border-box;
    padding: 30px;
    width: 320px;
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 20px;
    background-color: #FFFFFF;
  }
  .login-box-title {
    margin-bottom: 20px;
    text-align: center;
  }
  .input-box {
    position: relative;
    margin-bottom: 20px;
    border-radius: 52px;
    box-sizing: border-box;
    background-color: #F5F8FA;
  }
  .phone-number-icon {
    position: absolute;
    top: 14px;
    right: 20px;
  }
  .pin-code-input {
    padding: 17px 24px;
    width: 200px;
    box-sizing: border-box;
    border: none;
    border-radius: 52px;
    background-color: #F5F8FA;
  }
  .pin-code-input::placeholder {
    font-weight: 400;
    font-size: 15px;
    line-height: 18px;
    color: #C0CFD9;
  }
  .pin-code-input:focus {
    outline: 0;
  }
  .search-button {
    padding: 16px;
    text-align: center;
  }
  .phone-number-icon {
    width: 24px;
    height: 24px;
  }
  .send-button {
    text-align: center;
    padding: 16px 0;
    border-radius: 10px;
    color: #FFFFFF;
    background-color: #2D96DE;
  }
</style>

<template lang="pug">
.pin-code-wrap

  .login-box
    .login-box-title.h2.blue-02_01 대여현황 확인
    .input-box
      input.pin-code-input.body2-regular(
        v-model="phoneNumber"
        placeholder="전화번호를 입력해주세요."
      )
      img.phone-number-icon(src="~@/assets/input-phone-icon.png")

    .send-button.body2-bold(@click="send") 확인
</template>

<script>
export default {
  name: "PinCode",
  data() {
    return {
      phoneNumber: '',
    }
  },
  methods: {
    async send() {
      try {
        await this.$axios.post('/user/pin-codes', {
          phoneNumber: this.phoneNumber,
        });
        const replacePath = `?phoneNumber=${this.phoneNumber}`;
        this.$router.push({ path: `/login${replacePath}`, query: { phoneNumber: this.phoneNumber } });
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    }
  }
}
</script>
