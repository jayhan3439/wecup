<style lang="less" scoped>
  .title-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .search-wrap {
    display: flex;
    align-items: center;
  }
  .admin-input {
    margin-right: 10px;
    width: 221px;
  }
  .search-button {
    margin-right: 20px;
  }
  .edit {
    text-decoration: underline;
    cursor: pointer;
    color: #1862B6;
  }
  .delete {
    text-decoration: underline;
    cursor: pointer;
    color: #FF3B30;
  }
  /deep/.el-dialog {
    width: 375px;
    border-radius: 8px;
  }
  .button-wrap {
    display: flex;
    justify-content: flex-end;
    & > button {
      padding: 7px 16px;
      font-weight: 500;
      font-size: 12px;
      line-height: 18px;
      border-radius: 4px;
      cursor: pointer;
    }
  }
  .cancel {
    background-color: #FFFFFF;
    border: 1px solid #C9CDD2;
    color: #1B1D1F;
  }
  .confirm {
    margin-left: 10px;
    background-color: #8867C0;
    border: 0;
    color: #FFFFFF;
  }
  .more-load {
    margin-top: 20px;
    text-align: center;
    color: #000000;
    cursor: pointer;
  }
  /deep/.el-table td {
    text-align: center;
  }
  .edit {
    text-decoration: underline;
    cursor: pointer;
    color: #1862B6;
  }
  .switch-text {
    margin: 0 10px;
  }
  .alert-text {
    margin-bottom: 30px;
    font-size: 16px;
  }
  .cancel-button {
    color: #433A36;
    background-color: transparent;
  }
</style>

<template lang="pug">
.users-wrap
  .title-group
    .title.body3-bold 사용자 관리
  .header-group
    form.search-wrap
      input.admin-input(
        v-model="phoneNumber"
        placeholder="전화번호 입력",
      )
      button.search-button(@click.prevent="search") 검색
      el-select.admin-select(
        v-model="sort",
        placeholder="Select"
      )
        el-option(
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        )
      .switch-text 연체[장기미반납자]
      el-switch.admin-switch(
        v-model="overdue"
      )

  el-table.table(
    :data="users"
  )
    el-table-column(
      label="전화번호",
      prop="phoneNumber"
    )
    el-table-column(
      label="가입일자",
    )
      template(slot-scope="scope")
        .date {{ scope.row.createdAt | timeFilter }}
    el-table-column(
      label="마지막 대여일",
      prop="lastRentalDate"
    )
    el-table-column(
      label="미반납 컵 수",
      prop="notRestoreCupQuantity"
    )
    el-table-column(
      label="미반납 리드 수",
      prop="notRestoreLidQuantity"
    )
    el-table-column(
      label="사용 내역",
    )
      template(slot-scope="scope")
        .edit(@click="userLog(scope.row.phoneNumber)") 내역
    el-table-column(
      label="사용중지",
    )
      template(slot-scope="scope")
        .delete(@click="openDialog(scope.row)", v-if="scope.row.overdue == true") 해제
        .edit(v-else) 해제됨
  .more-load(
    v-if="isLoad"
    @click="moreLoad"
  ) 더 불러오기

  el-dialog.alert-dialog(
    :visible.sync="dialogVisible",
  )
    .alert-text.body3-bold.black-01 이용자의 연체를 풀어주시겠습니까?
    .button-wrap
      button.process-button.cancel-button(@click="closeDialog") 취소
      button.process-button(@click="confirm") 확인
</template>

<script>
import moment from 'moment';
moment.locale('ko');

export default {
  name: "Users",
  async asyncData({ app, route }) {
    const format = {
      offset: 0,
      limit: 50,
    };
    let sort = 'notRestoreCupQuantity';
    let phoneNumber = '';
    if (route.query.userLog !== undefined) {
      phoneNumber  = route.query.userLog;
      const { data: users } = await app.$axios.get('/admin/users', {
        params: {
          phoneNumber: phoneNumber,
          sort: sort,
          ...format,
        },
      });
      let isLoad = true;
      if (users.length < 50) isLoad = false;
      return { users, phoneNumber, isLoad, format, sort };
    } else {
      const { data: users } = await app.$axios.get('/admin/users', {
        params: {
          phoneNumber: phoneNumber,
          sort: sort,
          ...format,
        },
      });
      let isLoad = true;
      if (users.length < 50) isLoad = false;
      return { users, phoneNumber, isLoad, format, sort };
    }
  },
  filters: {
    timeFilter(val) {
      return moment(val).format('LLL');
    }
  },
  data() {
    return {
      dialogVisible: false,
      selectedUser: null,
      options: [{
        value: 'notRestoreCupQuantity',
        label: '미반납 컵'
      }, {
        value: 'notRestoreLidQuantity',
        label: '미반납 리드'
      }, {
        value: 'lastRentalDate',
        label: '마지막 대여 시각'
      }, {
        value: 'createdAt',
        label: '가입 시각 오름차순'
      }, {
        value: '-createdAt',
        label: '가입 시각 내림차순'
      }, {
        value: '',
        label: '전체'
      }],
      overdue: false,
    }
  },
  watch: {
    async sort(val) {
      try {
        const { data: result } = await this.$axios.get('/admin/users', {
          params: {
            phoneNumber: this.phoneNumber,
            sort: val,
            overdue: this.overdue
          },
        });
        this.users = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async overdue() {
      try {
        const { data: result } = await this.$axios.get('/admin/users', {
          params: {
            phoneNumber: this.phoneNumber,
            sort: this.sort,
            overdue: this.overdue
          },
        });
        this.users = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
  },
  methods: {
    async moreLoad() {
      this.format.offset += 50;
      try {
        const { data: result } = await this.$axios.get('/admin/users', {
          params: {
            phoneNumber: null,
            sort: this.sort,
            ...this.format,
          },
        });
        if (result.length < 50) this.isLoad = false;
        this.users = this.users.concat(result);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async search() {
      try {
        const { data: result } = await this.$axios.get('/admin/users', {
          params: {
            phoneNumber: this.phoneNumber,
            sort: this.sort,
          }
        });
        this.users = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    openDialog(val) {
      this.dialogVisible = true;
      this.selectedUser = val;
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    async confirm() {
      try {
        await this.$axios.put(`/admin/users/${this.selectedUser.phoneNumber}/overdue`);
        this.dialogVisible = false;
        this.$message.success('처리되었습니다.');
        setTimeout(async() => {
          const { data: result } = await this.$axios.get('/admin/users', {
            params: {
              sort: this.sort,
              ...this.format,
            }
          });
          this.users = result;
        }, 200);
        if (this.overdues.length < 50) isLoad = false;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    userLog(val) {
      const replacePath = `?userLog=${val}`;
      this.$router.push({ path: `/admin/detail${replacePath}`, query: { userLog: val } });
    }
  }
}
</script>
