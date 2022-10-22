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
    margin-left: 20px;
    margin-right: 20px;
    white-space: nowrap;
  }
  .start-day {
    margin-right: 10px;
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
    color: #FFFFFF;
    cursor: pointer;
  }
  /deep/.el-table td {
    text-align: center;
  }
  .more-load {
    padding: 12px 0;
    text-align: center;
    text-decoration: underline;
    cursor: pointer;
    color: #000000;
  }
  .cancel-button {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: #2D96DE;
    border: 0;
    background-color: unset;
  }
</style>

<template lang="pug">
.detail-wrap
  .title-group
    .title.body3-bold 이용 내역
  .header-group
    form.search-wrap(@submit.prevent="search")
      input.admin-input(
        v-model="phoneNumber"
        placeholder="전화번호 입력",
      )
      input.admin-input(
        v-model="franchiseeId"
        placeholder="가맹점 코드 입력",
      )
      el-date-picker.start-day(
        placeholder="Start day",
        type="date",
        v-model="start",
      )
      el-date-picker.end-day(
        placeholder="End day",
        type="date",
        v-model="end"
      )
      button.search-button(@click="search") 검색
      el-select.admin-select(
        v-model="type",
        placeholder="Select"
      )
        el-option(
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        )

  el-table.table(
    :data="userLogs"
  )
    el-table-column(
      label="가맹점 코드",
      prop="franchiseeId"
    )
    el-table-column(
      label="가맹점명",
      prop="franchisee.name"
    )
    el-table-column(
      label="구분",
    )
      template(slot-scope="scope")
        .type {{ typeCheck(scope.row.type) }}
    el-table-column(
      label="사용자 전화번호",
      prop="userPhoneNumber"
    )
    el-table-column(
      label="대여한 컵",
      prop="cupSerialNumber"
    )
    el-table-column(
      label="대여한 리드",
      prop="lidSerialNumber"
    )
    el-table-column(
      label="이벤트 발생 시각",
    )
      template(slot-scope="scope")
        .date {{ scope.row.createdAt | timeFilter }}
    el-table-column(
      label="연체 여부",
    )
      template(slot-scope="scope")
        .type {{ check(scope.row) }}
    el-table-column(
      label="취소 여부",
    )
      template(slot-scope="scope")
        .cancelled {{ cancelled(scope.row) }}
    el-table-column(
      label="이용자 대여 취소",
    )
      template(slot-scope="scope")
        button.cancel-button(@click="cancel(scope.row)") 취소

  .more-load(
    v-if="isLoad"
    @click="moreLoad"
  ) 더 불러오기
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
    let franchiseeId = '';
    let phoneNumber = '';
    let type = '';
    if (route.query.history !== undefined) {
      franchiseeId = route.query.history;
      const { data: userLogs } = await app.$axios.get('/admin/user-logs', {
        params: {
          franchiseeId: franchiseeId,
          ...format,
          type: type,
        }
      });
      let isLoad = true;
      if (userLogs.length < 50) isLoad = false;
      return { query: route.query, franchiseeId, phoneNumber, userLogs, type, isLoad, format};
    } else if (route.query.userLog !== undefined) {
      phoneNumber = route.query.userLog;
      const { data: userLogs } = await app.$axios.get('/admin/user-logs', {
        params: {
          phoneNumber: phoneNumber,
          ...format,
          type: type
        }
      });
      let isLoad = true;
      if (userLogs.length < 50) isLoad = false;
      return { query: route.query, franchiseeId, phoneNumber, userLogs, type, isLoad, format };
    } else {
      const { data: userLogs } = await app.$axios.get('/admin/user-logs', {
        params: {
          ...format,
          type: type
        }
      });
      let isLoad = true;
      if (userLogs.length < 50) isLoad = false;
      return { query: route.query, franchiseeId, phoneNumber, userLogs, type, isLoad, format};
    }
  },
  data() {
    return {
      options: [{
        value: 'rental',
        label: '대여'
      }, {
        value: 'restored',
        label: '반납'
      }, {
        value: '',
        label: '전체'
      }],
      start: '',
      end: '',
    }
  },
  filters: {
    dateFilter(val) {
      return moment(val).format('LL');
    },
    timeFilter(val) {
      return moment(val).format('LLL');
    }
  },
  watch: {
    async type(val) {
      try {
        const { data: result } = await this.$axios.get('/admin/user-logs', {
          params: {
            franchiseeId: this.franchiseeId,
            phoneNumber: this.phoneNumber,
            type: val,
          },
        });
        this.userLogs = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
  },
  methods: {
    async search() {
      try {
        const { data: result } = await this.$axios.get('/admin/user-logs', {
          params: {
            franchiseeId: this.franchiseeId,
            phoneNumber: this.phoneNumber,
            type: this.type,
            from: this.start,
            to: this.end
          }
        });
        this.userLogs = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    typeCheck(val) {
      if (val === "rental") {
        return '대여';
      } else if (val === "restored") {
        return '반납';
      }
    },
    check(val) {
      if (val.type === 'restored') {
        return 'N';
      }
      if (val.overdue === true) {
        return 'Y';
      } else {
        return 'N';
      }
    },
    cancelled(val) {
      if (val.canceled === true) {
        return '취소됨';
      } else {
        return '-';
      }
    },
    async cancel(userLogData) {
      const result = confirm("정말로 취소하시겠습니까?");
      if(result) {
        try {
          await this.$axios.delete(`/admin/user-logs/${userLogData._id}`);
          const { data: userLogs } = await this.$axios.get('/admin/user-logs', {
            params: {
              ...this.format,
              type: this.type,
            }
          });
          this.userLogs = userLogs;
        } catch (error) {
          if (error.response && error.response.data) this.$message.error(error.response.data.message);
        }
      };
    },
    async moreLoad() {
      this.format.offset += 50;
      try {
        const { data: result } = await this.$axios.get('/admin/user-logs', {
          params: {
            franchiseeId: this.franchiseeId,
            phoneNumber: this.phoneNumber,
            ...this.format,
            type: this.type,
          }
        });
        if (result.length < 50) this.isLoad = false;
        this.userLogs = this.userLogs.concat(result);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
  }
}
</script>
