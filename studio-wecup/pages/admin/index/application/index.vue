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
    justify-content: space-between;
    align-items: center;
    width: 100%;
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
  .left {
    .admin-select {
      margin-right: 20px;
    }
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
  // .cancel {
  //   background-color: #FFFFFF;
  //   border: 1px solid #C9CDD2;
  //   color: #1B1D1F;
  // }
  // .confirm {
  //   margin-left: 10px;
  //   background-color: #8867C0;
  //   border: 0;
  //   color: #FFFFFF;
  // }
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
.application-wrap
  .title-group
    .title.body3-bold ?????? ??????
  .header-group
    form.search-wrap
      .left
        input.admin-input(
          v-model="franchiseeId"
          placeholder="????????? ????????????",
        )
        button.search-button(@click.prevent="search") ??????
        el-select.admin-select(
          v-model="type",
          placeholder="?????? ??????"
        )
          el-option(
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          )
        el-select.admin-select(
          v-model="status",
          placeholder="?????? ?????? ??????"
        )
          el-option(
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          )
      .right
        el-select.admin-select(
          v-model="sort",
          placeholder="????????????"
        )
          el-option(
            v-for="item in sortOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          )

  el-table.table(
    :data="applications"
  )
    el-table-column(
      label="????????? ???",
      prop="franchiseeName"
    )
    el-table-column(
      label="????????? ????????????",
      prop="franchiseeId"
    )
    el-table-column(
      label="????????????",
    )
      template(slot-scope="scope")
        .date {{ scope.row.createdAt | timeFilter }}
    el-table-column(
      label="?????? ??????",
    )
      template(slot-scope="scope")
        .date {{ typeCheck(scope.row.type) }}
    el-table-column(
      label="?????? ??????",
      prop="cupQuantity"
    )
    el-table-column(
      label="?????? ?????????",
      prop="lidQuantity"
    )
    el-table-column(
      label="?????? ??????",
    )
      template(slot-scope="scope")
        .date {{ statusCheck(scope.row.status) }}
    el-table-column(
      label="??????",
    )
      template(slot-scope="scope")
        .edit(@click="openProcess(scope.row)") ??????
    el-table-column(
      label="??????",
    )
      template(slot-scope="scope")
        .edit(@click="cancel(scope.row._id)") ??????

  .more-load(
    v-if="isLoad"
    @click="moreLoad"
  ) ??? ????????????

  el-dialog.receive-dialog(
    :visible.sync="receiveDialogVisible",
    @closed="closedDialog"
  )
    receive-count(
      @receiveClose="receiveClose",
      @receive="receive",
      :franchiseeId="franchiseeId",
      :stores="stores",
      :nowStore="nowStore",
      :nowLid="nowLid",
      :nowCup="nowCup"
    )

  el-dialog.restore-dialog(
    :visible.sync="restoreDialogVisible",
    @closed="closedDialog"
  )
    restore-count(
      @restoreClose="restoreClose",
      @restore="restore"
      :franchiseeId="franchiseeId",
      :stores="stores",
      :nowStore="nowStore",
      :nowLid="nowLid",
      :nowCup="nowCup"
    )

  el-dialog.cancel-dialog(
    :visible.sync="cancelDialogVisible",
  )
    .alert-text.body3-bold.black-01 ?????????????????????????
    .button-wrap
      button.process-button.cancel-button(@click="closeCancelDialog") ??????
      button.process-button(@click="cancelRequest") ??????
</template>

<script>
import ReceiveCount from './.components/ReceiveCount.vue';
import RestoreCount from './.components/RestoreCount.vue';

import moment from 'moment';
moment.locale('ko');

export default {
  name: "Application",
  async asyncData({ app }) {
    const format = {
      offset: 0,
      limit: 50,
    };
    let type = '';
    let status = '';
    let sort = '';
    const { data: applications } = await app.$axios.get('/admin/applications', {
      params: {
        ...format,
      },
    });
    const { data: stores } = await app.$axios.get('/admin/franchisees');
    let isLoad = true;
    if (applications.length < 50) isLoad = false;
    return { applications, stores, isLoad, format, type, status, sort };
  },
  components: {
    ReceiveCount,
    RestoreCount
  },
  filters: {
    timeFilter(val) {
      return moment(val).format('LLL');
    }
  },
  data() {
    return {
      franchiseeId: '',
      nowId: '',
      nowCup: '',
      nowLid: '',
      nowStore: '',
      receiveDialogVisible: false,
      restoreDialogVisible: false,
      typeOptions: [{
        value: 'restore',
        label: '??????'
      },{
        value: 'receive',
        label: '??????'
      },{
        value: '',
        label: '??????',
      }],
      statusOptions: [{
        value: 'canceled',
        label: '?????????'
      },{
        value: 'completed',
        label: '??????'
      },{
        value: 'waiting',
        label: '?????????'
      },{
        value: '',
        label: '??????',
      }],
      sortOptions: [{
        value: 'franchiseeName',
        label: '????????? ?????? ????????????'
      }, {
        value: '-createdAt',
        label: '???????????? ?????????'
      }, {
        value: 'createdAt',
        label: '???????????? ?????????'
      }],
      cancelDialogVisible: false,
      cancelData: null,
    }
  },
  watch: {
    async type(val) {
      try {
        const { data: result } = await this.$axios.get('/admin/applications', {
          params: {
            franchiseeId: this.franchiseeId,
            type: val,
            status: this.status,
            sort: this.sort,
            ...this.format,
          }
        });
        this.applications = result;
        if (result.length < 50) this.isLoad = false;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async status(val) {
      try {
        const { data: result } = await this.$axios.get('/admin/applications', {
          params: {
            franchiseeId: this.franchiseeId,
            type: this.type,
            status: val,
            sort: this.sort,
            ...this.format,
          }
        });
        this.applications = result;
        if (result.length < 50) this.isLoad = false;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async sort(val) {
      try {
        const { data: result } = await this.$axios.get('/admin/applications', {
          params: {
            franchiseeId: this.franchiseeId,
            type: this.type,
            status: this.status,
            sort: val,
            ...this.format,
          },
        });
        this.applications = result;
        if (result.length < 50) this.isLoad = false;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
  },
  methods: {
    openReceive() {
      this.receiveDialogVisible = true;
    },
    receiveClose() {
      this.nowId = '';
      this.nowStore = '';
      this.nowCup = '';
      this.nowLid = '';
      this.receiveDialogVisible = false;
    },
    openRestore() {
      this.restoreDialogVisible = true;
    },
    restoreClose() {
      this.nowId = '';
      this.nowStore = '';
      this.nowCup = '';
      this.nowLid = '';
      this.restoreDialogVisible = false;
    },
    closedDialog() {
      this.franchiseeId = '';
    },
    addStore(val) {
      this.franchiseeId = val;
    },
    async moreLoad() {
      this.format.offset += 50;
      try {
        const { data: result } = await this.$axios.get('/admin/applications', {
          params: {
            franchiseeId: this.franchiseeId,
            type: this.type,
            status: this.status,
            sort: this.sort,
            ...this.format,
          },
        });
        if (result.length < 50) this.isLoad = false;
        this.applications = this.applications.concat(result);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async search() {
      try {
        const { data: result } = await this.$axios.get('/admin/applications', {
          params: {
            franchiseeId: this.franchiseeId,
            type: this.type,
            status: this.status,
            sort: this.sort,
          }
        });
        this.applications = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    typeCheck(val) {
      if (val === 'restore') {
        return '??????';
      } else if (val === 'receive') {
        return '??????';
      }
    },
    statusCheck(val) {
      if (val === 'canceled') {
        return '?????????';
      } else if (val === 'completed') {
        return '?????????';
      } else if (val === 'waiting') {
        return '?????????';
      }
    },
    openProcess(val) {
      if (val.status === 'waiting') {
        if (val.type === 'receive') {
          this.receiveDialogVisible = true;
        } else if (val.type === 'restore') {
          this.restoreDialogVisible = true;
        }
        this.nowId = val._id;
        this.nowStore = val.franchiseeId;
        this.nowCup = val.cupQuantity;
        this.nowLid = val.lidQuantity;
      }
    },
    async receive(val) {
      try {
        await this.$axios.post('/admin/release', {
          franchiseeId: this.nowStore,
          applicationId: this.nowId,
          cupQuantity: Number(val.cup),
          lidQuantity: Number(val.lid),
        });
        this.$message.success('?????? ?????????????????????.');
        this.receiveDialogVisible = false;
        setTimeout(async() => {
          const { data: result } = await this.$axios.get('/admin/applications', {
            params: {
              ...this.format,
            }
          });
          this.applications = result;
        }, 200);
      } catch(e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async restore(val) {
      try {
        await this.$axios.post('/admin/receive', {
          franchiseeId: this.nowStore,
          applicationId: this.nowId,
          cupQuantity: Number(val.cup),
          lidQuantity: Number(val.lid),
        });
        this.$message.success('?????? ?????????????????????.');
        this.restoreDialogVisible = false;
        setTimeout(async() => {
          const { data: result } = await this.$axios.get('/admin/applications', {
            params: {
              ...this.format,
            }
          });
          this.applications = result;
        }, 200);
      } catch(e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async cancel(val) {
      this.cancelData = val;
      this.cancelDialogVisible = true;
    },
    closeCancelDialog() {
      this.cancelDialogVisible = false;
    },
    async cancelRequest() {
      try {
        await this.$axios.put(`/admin/applications/${this.cancelData}/canceled`);
        this.$message.success('?????? ?????????????????????.');
        setTimeout(async() => {
          const { data: result } = await this.$axios.get('/admin/applications');
          this.applications = result;
        }, 200);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    }
  }
}
</script>
