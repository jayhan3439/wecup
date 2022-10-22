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
.overdue-wrap
  .title-group
    .title.body3-bold 연체 내역
  .header-group
    form.search-wrap
      el-select.admin-select(
        v-model="type",
        placeholder="전체 제품"
      )
        el-option(
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        )

  el-table.table(
    :data="overdues"
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
      label="사용자 전화번호",
      prop="userPhoneNumber"
    )
    el-table-column(
      label="제품",
    )
      template(slot-scope="scope")
        .date {{ product(scope.row) }}
    el-table-column(
      label="대여한 컵",
      prop="cupSerialNumber"
    )
    el-table-column(
      label="대여한 리드",
      prop="lidSerialNumber"
    )
    el-table-column(
      label="대여일시",
    )
      template(slot-scope="scope")
        .date {{ scope.row.createdAt | timeFilter }}
    el-table-column(
      label="반납기일",
    )
      template(slot-scope="scope")
        .date {{ scope.row.expiredAt | timeFilter }}
    el-table-column(
      label="연체기간",
    )
      template(slot-scope="scope")
        .date {{ overdue(scope.row.expiredAt) }}일
    el-table-column(
      label="연체여부",
    )
      template(slot-scope="scope")
        .edit(@click="userLog(scope.row.userPhoneNumber)") 이동하기

  .more-load(
    v-if="isLoad"
    @click="moreLoad"
  ) 더 불러오기
</template>

<script>
import moment from 'moment';
moment.locale('ko');

export default {
  name: "Overdue",
  async asyncData({ app }) {
    const format = {
      offset: 0,
      limit: 50,
    };
    let type = '';
    const { data: overdues } = await app.$axios.get('/admin/overdue', {
      params: {
        type: type,
        ...format,
      }
    });
    let isLoad = true;
    if (overdues.length < 50) isLoad = false;
    return { overdues, isLoad, format, type };
  },
  data() {
    return {
      dialogVisible: false,
      options: [{
        value: 'cup',
        label: '컵'
      }, {
        value: 'lid',
        label: '리드'
      },{
        value: '',
        label: '전체'
      }],
      nowDate: new Date(),
      selectedUser: null,
    }
  },
  filters: {
    timeFilter(val) {
      return moment(val).format('LLL');
    }
  },
  watch: {
    async type(val) {
      try {
        const { data: result } = await this.$axios.get('/admin/overdue', {
          params: {
            type: val,
          },
        });
        this.overdues = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
  },
  methods: {
    product(val) {
      if (val.cupSerialNumber !== undefined && val.lidSerialNumber !== undefined) {
        return '컵, 리드';
      } else if (val.cupSerialNumber !== undefined) {
        return '컵';
      } else if (val.lidSerialNumber !== undefined) {
        return '리드';
      }
    },
    async moreLoad() {
      this.format.offset += 50;
      try {
        const { data: result } = await this.$axios.get('/admin/overdue', {
          params: {
            ...this.format,
          },
        });
        if (result.length < 50) this.isLoad = false;
        this.overdues = this.overdues.concat(result);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    overdue(val) {
      const expired = new Date(val);
      const date = this.nowDate.getTime() - expired.getTime();
      let btDay = date / (1000*60*60*24) + 1;
      return Math.floor(btDay);
    },
    userLog(val) {
      const replacePath = `?userLog=${val}`;
      this.$router.push({ path: `/admin/users${replacePath}`, query: { userLog: val } });
    }
  }
}
</script>
