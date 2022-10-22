<style lang="less" scoped>
  .title-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .action-button-group {
    display: flex;

    .action-button {
      margin-left: 10px;
    }
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
  .myrow {
    background-color: green !important;
  }
  /deep/.left-border {
    border-left: 2px solid #c1c1c1;
  }
  /deep/.right-border {
    border-right: 2px solid #c1c1c1;
  }
  .table-cancel {
    text-decoration: underline;
    cursor: pointer;
    color: #1862B6;
  }
  .alert-text {
    margin-bottom: 30px;
    font-size: 16px;
  }
  .button-group {
    display: flex;
    justify-content: flex-end;
  }
  .cancel-button {
    color: #433A36;
    background-color: transparent;
  }
  .cancelled {
    color: #c8201b;
  }
</style>

<template lang="pug">
.store-wrap
  .title-group
    .title.body3-bold 출입고 관리
    .action-button-group
      .action-button(@click="openRelease") 출고하기
      .action-button(@click="openWarehousing") 입고하기
  .header-group
    form.search-wrap
      input.admin-input(
        v-model="q",
        placeholder="가맹점 일련번호 조회",
      )
      button.search-button(@click.prevent="search") 검색

  el-table.table(
    :data="storeManagements"
  )
    el-table-column(
      label="가맹점 일련번호",
      prop="franchisee._id",
    )
    el-table-column(
      label="가맹점명",
      prop="franchisee.name"
    )
    el-table-column(
      label="출입고 시각",
      prop="createdAt"
    )
      template(slot-scope="scope")
        .date {{ scope.row.createdAt | timeFilter }}
    el-table-column(
      label="출고수량 (컵)",
      class-name="left-border",
      width="120"
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.receiveCup) }}
    el-table-column(
      label="출고수량 (리드)",
      class-name="right-border",
      width="120"
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.receiveLid) }}
    el-table-column(
      label="반송수량 (컵)",
      width="120"
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.releaseCup) }}
    el-table-column(
      label="반송수량 (리드)",
      class-name="right-border",
      width="120"
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.releaseLid) }}
    el-table-column(
      label="최종 가맹점 재고 (컵)",
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.franchiseeCupQuantity) }}
    el-table-column(
      label="최종 가맹점 재고 (리드)",
      class-name="right-border"
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.franchiseeLidQuantity) }}
    el-table-column(
      label="최종 위컵 재고 (컵)",
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.wecupCupQuantity) }}
    el-table-column(
      label="최종 위컵 재고 (리드)",
      class-name="right-border"
    )
      template(slot-scope="scope")
        .count {{ countItem(scope.row.wecupLidQuantity) }}
    el-table-column(
      label="취소",
      width="120"
    )
      template(slot-scope="scope")
        .table-cancel(@click="openDialog(scope.row._id)", v-if="!scope.row.canceled") 취소
        .cancelled(v-if="scope.row.canceled") 취소됨
  .more-load(
    v-if="isLoad"
    @click="moreLoad"
  ) 더 불러오기

  el-dialog.release-dialog(
    :visible.sync="releaseDialogVisible",
    @closed="closedDialog"
  )
    release-count(
      @releaseClose="releaseClose",
      @storeSearch="storeSearch",
      @addStore="addStore",
      @closeSearchStore="closeSearchStore",
      @release="release",
      :storeId="storeId",
      :stores="stores"
    )

  el-dialog.warehousin-dialog(
    :visible.sync="warehousingDialogVisible",
    @closed="closedDialog"
  )
    warehousing(
      @warehousingClose="warehousingClose",
      @storeSearch="storeSearch",
      @addStore="addStore",
      @closeSearchStore="closeSearchStore",
      @warehousing="warehousing",
      :storeId="storeId",
      :stores="stores"
    )
  el-dialog.cancel-dialog(
    :visible.sync="cancelDialogVisible",
    append-to-body,
  )
    .alert-text.body3-bold.black-01 취소하시겠습니까?
    .button-group
      button.cancel-button.process-button(@click="closeAlert") 취소
      button.process-button(@click="cancelProcess") 확인
</template>

<script>
import ReleaseCount from './.components/ReleaseCount.vue';
import Warehousing from './.components/Warehousing.vue';

import moment from 'moment';
moment.locale('ko');

export default {
  name: "Store",
  async asyncData({ app, route }) {
    const format = {
      offset: 0,
      limit: 50,
    };
    let q = '';
    if (route.query.stock !== undefined) {
      const { data: storeManagements } = await app.$axios.get('/admin/franchisee-logs', {
        params: {
          q: route.query.stock,
          ...format,
        }
      });
      q = route.query.stock;
      const { data: stores } = await app.$axios.get('/admin/franchisees');
      let isLoad = true;
      if (storeManagements.length < 50) isLoad = false;
      return { query: route.query, storeManagements, isLoad, format, stores, q };
    } else {
      const { data: storeManagements } = await app.$axios.get('/admin/franchisee-logs', {
        params: {
          q: route.query.stock,
          ...format,
        } 
      });
      const { data: stores } = await app.$axios.get('/admin/franchisees');

      let isLoad = true;
      if (storeManagements.length < 50) isLoad = false;
      return { stores, storeManagements, isLoad, format, q };
    }
  },
  components: {
    ReleaseCount,
    Warehousing
  },
  data() {
    return {
      storeId: '',
      releaseDialogVisible: false,
      editDialogVisible: false,
      warehousingDialogVisible: false,
      cancelDialogVisible: false,
      franchiseeLogsId: '',
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
  methods: {
    async search() {
      try {
        const { data: result } = await this.$axios.get('/admin/franchisee-logs', {
          params: {
            q: this.q,
          }
        });
        this.storeManagements = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    openRelease() {
      this.releaseDialogVisible = true;
    },
    releaseClose() {
      this.releaseDialogVisible = false;
    },
    openWarehousing() {
      this.warehousingDialogVisible = true;
    },
    warehousingClose() {
      this.warehousingDialogVisible = false;
    },
    async closeSearchStore() {
      try {
        const { data: result } = await this.$axios.get('/admin/franchisees');
        this.stores = result;
      } catch(e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async storeSearch(val) {
      try {
        const { data: result } = await this.$axios.get('/admin/franchisees', {
          params: {
            q: val,
          }
        });
        this.stores = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    addStore(val) {
      this.storeId = val;
    },
    closedDialog() {
      this.storeId = '';
    },
    async warehousing(val) {
      try {
        await this.$axios.post('/admin/receive', {
          franchiseeId: this.storeId,
          ...val,
        });
        this.$message.success('입고 처리되었습니다.');
        this.warehousingDialogVisible = false;
        setTimeout(async() => {
          const { data: result } = await this.$axios.get('/admin/franchisee-logs');
          this.storeManagements = result;
        }, 200);
      } catch(e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async release(val) {
      try {
        await this.$axios.post('/admin/release', {
          franchiseeId: this.storeId,
          ...val,
        });
        this.$message.success('출고 처리되었습니다.');
        this.releaseDialogVisible = false;
        setTimeout(async() => {
          const { data: result } = await this.$axios.get('/admin/franchisee-logs');
          this.storeManagements = result;
        }, 200);
      } catch(e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async moreLoad() {
      this.format.offset += 50;
      try {
        const { data: result } = await this.$axios.get('/admin/franchisee-logs', {
          params: {
            q: this.q,
            ...this.format,
          },
        });
        if (result.length < 50) this.isLoad = false;
        this.storeManagements = this.storeManagements.concat(result);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    countItem(val) {
      if (val === 0) {
        return '-';
      } else {
        return val;
      }
    },
    closeAlert() {
      this.cancelDialogVisible = false;
    },
    openDialog(val) {
      this.franchiseeLogsId = val;
      this.cancelDialogVisible = true;
    },
    async cancelProcess() {
      try {
        await this.$axios.delete(`/admin/franchisee-logs/${this.franchiseeLogsId}`);
        this.$message.success('취소 되었습니다.');
        this.cancelDialogVisible = false;
        setTimeout(async() => {
          const { data: result } = await this.$axios.get('/admin/franchisee-logs');
          this.storeManagements = result;
        }, 200);
      } catch(e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    }
  }
}
</script>
