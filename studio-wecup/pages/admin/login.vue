<style lang="less" scoped>
  .login-wrap {
    height: 100vh;
  }
  .header-wrap {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    box-shadow: inset 0px -1px 0px rgba(112, 112, 112, 0.3);
  }
  .left-side {
    display: flex;
    align-items: center;
  }
  .ailo-logo {
    margin-right: 3px;
    width: 44px;
    height: 14px;
  }
  .login-box-wrap {
    width: 100%;
    height: 90vh;
    position: relative;
  }
  .login-box {
    display: flex;
    flex-direction: column;
    padding: 50px 40px 40px 40px;
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;
    transform: translate(-50%, -50%);
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.14);
    border: 0.75px solid #D8D8D8;
    border-radius: 12px;
    background-color: #FFFFFF;

    .admin-input {
      margin-bottom: 10px;
      width: 276px;
    }
  }
  .login-title {
    margin: 0 0 40px 0;
    font-weight: bold;
    font-size: 23px;
    line-height: 27px;
  }
  .login-button {
    padding: 6px 0;
    width: 100%;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #FFFFFF;
    background-color: #2D96DE;
  }
</style>

<template lang="pug">
.login-wrap
  .header-wrap
    .left-side
      span.admin-text.body3-bold.black-01 위컵 관리자
  .login-box-wrap
    form.login-box
      h2.login-title 관리자
      input.admin-input.body3-regular(
        v-model="username",
        placeholder="아이디"
      )
      input.admin-input.body3-regular(
        v-model="password"
        placeholder="비밀번호",
        type="password"
      )
      button.login-button.body3-bold(@click.prevent="adminLogin") 로그인
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async adminLogin() {
      try {
        const { data: admin } = await this.$axios.post('/admin/login', {
          username: this.username,
          password: this.password,
        });
        this.$cookies.set('admintoken', admin.adminLoginToken);
        this.$message.success('로그인 되었습니다.');
        this.$router.push('/admin/store');
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
  },
}
</script>
