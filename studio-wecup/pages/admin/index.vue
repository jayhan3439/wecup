<style lang="less" scoped>
  .wecup-admin {
    height: 100vh;
    overflow: hidden;
  }
  .header-wrap {
    box-shadow: inset 0px -1px 0px rgba(112, 112, 112, 0.3);
  }
  .left {
    padding: 10px 20px;
    width: 224px;
    box-sizing: border-box;
    box-shadow: 1px 0px 12px rgba(0, 0, 0, 0.11);
  }
  .content {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow-y: hidden;
  }
  a {
    display: block;
    padding: 11px 0 11px 16px;
    text-decoration: none;
  }
  .nav-menus {
    margin: 0;
    padding: 0;
    max-width: 224px;
    width: 100%;
    position: relative;
    list-style: none;
    box-shadow: 1px 0px 12px rgba(0, 0, 0, 0.11);
  }
  .logout {
    position: absolute;
    left: 16px;
    bottom: 12px;
    cursor: pointer;
  }
  .menu {
    font-size: 12px;
    line-height: 18px;
  }
  .nuxt-link-active {
    color: #2D96DE;
    background-color: #E8F4FC;;
  }
  .page-view {
    padding: 20px 20px 60px 20px;
    width: 100%;
    overflow-y: scroll;
    scrollbar-width: none;
  }
  .page-view::-webkit-scrollbar {
    width: 10px;
  }
  .page-view::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: black;
  }
</style>

<template lang="pug">
section.wecup-admin
  .header-wrap
    .left
      span.admin-text.body3-bold.black-01 위컵 관리자
  .content
    ul.nav-menus
      li.menu
        nuxt-link(to="/admin/store").body3-regular.gray_01 가맹점
      li.menu
        nuxt-link(to="/admin/cup").body3-regular.gray_01 컵
      li.menu
        nuxt-link(to="/admin/management").body3-regular.gray_01 출입고
      li.menu
        nuxt-link(to="/admin/application").body3-regular.gray_01 신청 내역
      li.menu
        nuxt-link(to="/admin/users").body3-regular.gray_01 사용자
      li.menu
        nuxt-link(to="/admin/detail").body3-regular.gray_01 이용 내역
      li.menu
        nuxt-link(to="/admin/overdue").body3-regular.gray_01 연체 내역

    .logout.body3-bold 로그아웃
    .page-view
      nuxt-child
</template>

<script>

export default {
  middleware: ['adminToken'],
  asyncData({ route, redirect }) {
    const path = route.path;
    if (path === '/admin') {
      redirect('/admin/store');
    }
  },
  methods: {
    logout() {
      this.$cookies.remove('admintoken');
      window.location.href = '/admin/login';
    },
  },
}
</script>
