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
  .value-section {
    display: flex;
    align-items: center;
    padding: 40px 0 30px 0;
    width: 800px;
    border-bottom: 1px solid #F1F1F1;
  }
  .lid-section {
    border: none;
  }
  .cup-title {
    margin-right: 60px;
  }
  .value {
    margin-right: 60px;

    .count-label {
      margin-bottom: 4px;
    }
  }
  .info {
    padding-left: 20px;

    .descript {
      margin-bottom: 2px;
    }
  }
  /deep/.el-dialog {
    width: 375px;
    border-radius: 8px;
  }
  .table-frame {
    display: flex;
    justify-content: space-between;
  }
  .table-cup-frame {
    width: 49%;
  }
  .cup-management-title {
    margin: 0px 0 20px;
    font-weight: 700;
    font-size: 24px;
    line-height: 117%;
  }
  table {
    width: 100%;
    border-spacing: 1px;
  }
  .th-text {
    width: 50%;
    height: 32px;
    padding: 0;
    font-weight: 700;
    font-size: 14px;
    line-height: 17px;
    background-color: #F9F9F9;
    box-shadow: 0px -1px 0px #EFEFEF, 0px 0px 3px #EFEFEF;
  }
  tbody {
    box-shadow: 0px -1px 0px #EFEFEF, 0px 0px 3px #EFEFEF;
  }
  .td-text {
    height: 36px;
    padding: 0;
    text-align: center;
    &.edit-button {
      color: #2D96DE;
    }
    &.delete-button {
      color: #DE2D2D;
    }
  }
  .more-load {
    margin-top: 20px;
    cursor: pointer;
    padding: 12px 0;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    color: #000000;
  }
  .sub-line {
    width: 100%;
    height: 1px;
    background: #EFEFEF;
  }
  .title-gap {
    margin-top: 36px;
  }
  .input-parent {
    display: flex;
    margin: 36px 0;
  }
  .search-input {
    width: 400px;
  }
  .search-button {
    min-width: 100px;
    padding: 4px 8px;
    background: #2D96DE;
    border-radius: 4px;
    font-weight: 700;
    font-size: 15px;
    margin-left: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    cursor: pointer;
  }
</style>

<template lang="pug">
  .cup-wrap
    .title-group
      .title.body3-bold 컵 관리
      .action-button-group
        .action-button(@click="addLid") 리드 등록
        .action-button(@click="addCup") 신규 컵 등록

    .cup-section.value-section
      .cup-title.h1 컵
      .value
        .count-label.body3-bold.black-01 유통수량
        .count.h1 {{ this.cups.totalCupQuantity }}
      .value
        .count-label.body3-bold.black-01 위컵 보유량
        .count.h1 {{ this.cups.wecupCupQuantity }}
      .value
        .count-label.body3-bold.black-01 가맹점 보유량
        .count.h1 {{ this.cups.franchiseeCupQuantity }}
      .value
        .count-label.body3-bold.black-01 고객 보유량
        .count.h1 {{ this.cups.userCupQuantity }}

    .lid-section.value-section
      .cup-title.h1 리드
      .value
        .count-label.body3-bold.black-01 유통수량
        .count.h1 {{ this.lids.totalLidQuantity }}
      .value
        .count-label.body3-bold.black-01 위컵 보유량
        .count.h1 {{ this.lids.wecupLidQuantity }}
      .value
        .count-label.body3-bold.black-01 가맹점 보유량
        .count.h1 {{ this.lids.franchiseeLidQuantity }}
      .value
        .count-label.body3-bold.black-01 고객 보유량
        .count.h1 {{ this.lids.userLidQuantity }}

    ul.info
      li.descript.body3-regular.black-01 유통 컵 수 : 현재 위컵에 등록된 모든 컵 수량
      li.descript.body3-regular.black-01 위컵 보유량: 위컵이 재고로 보유중인 컵 수량
      li.descript.body3-regular.black-01 가맹점 보유량: 가맹점이 재고로 보유중인 컵 수량
      li.descript.body3-regular.black-01 고객 보유량: 고객이 대여한 컵 수량 (미반납)
    .sub-line
    .input-parent
      el-input.search-input(v-model="searchQ", placeholder="컵 또는 리드 일련번호 입력")
      .search-button(@click="search") 검색
    .table-frame
      .table-cup-frame
        p.cup-management-title 등록된 컵
        table
          thead
            tr
              th.th-text 컵 일련번호
              th.th-text 삭제
          tbody
            tr(v-for="serialNumber in cupSerialNumbers")
              td.td-text {{serialNumber.serialNumber}}
              td.td-text.delete-button(@click="cupDelete(serialNumber.serialNumber)") 삭제
      .table-cup-frame
        p.cup-management-title 등록된 리드
        table
          thead
            tr
              th.th-text 리드 일련번호
              th.th-text 삭제
          tbody
            tr(v-for="serialNumber in lidSerialNumbers")
              td.td-text {{serialNumber.serialNumber}}
              td.td-text.delete-button(@click="lidDelete(serialNumber.serialNumber)") 삭제
    .more-load(
      v-if="isLoad"
      @click="moreLoad"
    ) 더 불러오기
    el-dialog.add-dialog(
      :visible.sync="addCupDialogVisible",
    )
      add-cup(
        :cupData="cupData",
        @cupSave="cupSave",
        @cupClose="cupClose"
      )

    el-dialog.add-dialog(
      :visible.sync="addLidDialogVisible",
    )
      add-lid(
        :lidData="lidData",
        @lidSave="lidSave",
        @lidClose="lidClose"
      )

    el-dialog.delete-dialog(
      :visible.sync="deleteCupDialogVisible",
    )
      delete-cup(
        @deleteCup="deleteCup",
        @deleteClose="deleteClose"
      )

    el-dialog.delete-dialog(
      :visible.sync="deleteLidDialogVisible",
    )
      delete-lid(
        @deleteLid="deleteLid",
        @deleteClose="deleteClose"
      )
</template>

<script>
import AddCup from './.components/AddCup';
import AddLid from './.components/AddLid';
import DeleteCup from './.components/DeleteCup';
import DeleteLid from './.components/DeleteLid';

export default {
  name: "Cup",
  async asyncData({ app }) {
    const format = {
      offset: 0,
      limit: 20,
    };
    const { data: cups } = await app.$axios.get('/admin/cups');
    const { data: lids } = await app.$axios.get('/admin/lids');
    const { data: cupSerialNumbers } = await app.$axios.get('/admin/cups/serialNumbers', {
      params: {
        ...format,
      }
    });
    const { data: lidSerialNumbers } = await app.$axios.get('/admin/lids/serialNumbers', {
      params: {
        ...format,
      }
    });
    let isLoad = true;
    if (cupSerialNumbers.length < 20 || lidSerialNumbers.length < 20) isLoad = false;
    return { cups, lids, cupSerialNumbers, lidSerialNumbers, format, isLoad };
  },
  components: {
    AddCup,
    AddLid,
    DeleteCup,
    DeleteLid,
  },
  data() {
    return {
      addCupDialogVisible: false,
      addLidDialogVisible: false,
      deleteCupDialogVisible: false,
      deleteLidDialogVisible: false,
      lidData: '',
      cupData: '',
      deleteData: '',
      serialNumberValue: '',
      isLoad: true,
      searchQ: '',
      serialNumbers: [],
    }
  },
  methods: {
    addCup() {
      this.addCupDialogVisible = true;
    },
    addLid() {
      this.addLidDialogVisible = true;
    },
    cupDelete(serialNumber) {
      this.deleteCupDialogVisible = true;
      this.serialNumberValue = serialNumber;
    },
    lidDelete(serialNumber) {
      this.deleteLidDialogVisible = true;
      this.serialNumberValue = serialNumber;
    },
    cupClose() {
      this.addCupDialogVisible = false;
    },
    lidClose() {
      this.addLidDialogVisible = false;
    },
    deleteClose() {
      this.deleteCupDialogVisible = false;
      this.deleteLidDialogVisible = false;
    },
    async cupSave(val) {
      const content = val.replace(/(?:\r\n|\r|\n)/g, '<br>');
      const cupArr = content.split('<br>');

      for(let i = 0; i < cupArr.length; i++) {
        this.serialNumbers.push({ "serialNumber": cupArr[i]});
      }
      try {
        await this.$axios.post('/admin/cups', {
          serialNumbers: this.serialNumbers,
        });
        this.$message.success('저장 되었습니다.');
        this.addCupDialogVisible = false;
        setTimeout(async () => {
          const { data: result } = await this.$axios.get('/admin/cups');
          this.cups = result;
          this.refreshSerialNumbers();
        }, 200);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
      this.serialNumbers = [];
    },
    async lidSave(val) {
      const content = val.replace(/(?:\r\n|\r|\n)/g, '<br>');
      const cupArr = content.split('<br>');

      for(let i = 0; i < cupArr.length; i++) {
        this.serialNumbers.push({ "serialNumber": cupArr[i]});
      }
      try {
        await this.$axios.post('/admin/lids', {
          serialNumbers: this.serialNumbers,
        });
        this.$message.success('저장 되었습니다.');
        this.addLidDialogVisible = false;
        setTimeout(async () => {
          const { data: result } = await this.$axios.get('/admin/lids');
          this.lids = result;
          this.refreshSerialNumbers();
        }, 200);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
      this.serialNumbers = [];
    },
    async refreshSerialNumbers() {
      this.format.offset = 0;
      try {
        const { data: cups } = await this.$axios.get('/admin/cups/serialNumbers', {
          params: {
            ...this.format,
          }
        });
        const { data: lids } = await this.$axios.get('/admin/lids/serialNumbers', {
          params: {
            ...this.format,
          }
        });
        if (cups.length < this.format.offset || lids < this.format.offset) this.isLoad = false;
        this.cupSerialNumbers = cups;
        this.lidSerialNumbers = lids;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async deleteCup(cupData) {
      await this.$axios.put(`/admin/cups/${this.serialNumberValue}`, {
        deleteReason: cupData,
      });
      this.refreshSerialNumbers();
      this.deleteCupDialogVisible = false;
    },
    async deleteLid(lidData) {
      await this.$axios.put(`/admin/lids/${this.serialNumberValue}`, {
        deleteReason: lidData,
      });
      this.refreshSerialNumbers();
      this.deleteLidDialogVisible = false;
    },
    async moreLoad() {
      this.format.offset += 20;
      try {
        const { data: cups } = await this.$axios.get('/admin/cups/serialNumbers', {
          params: {
            ...this.format,
          }
        });
        const { data: lids } = await this.$axios.get('/admin/lids/serialNumbers', {
          params: {
            ...this.format,
          }
        });
        if (cups.length < this.format.offset || lids < this.format.offset) this.isLoad = false;
        this.cupSerialNumbers = this.cupSerialNumbers.concat(cups);
        this.lidSerialNumbers = this.lidSerialNumbers.concat(lids);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async search() {
      this.format.offset = 0;
      try {
        const { data: cups } = await this.$axios.get('/admin/cups/serialNumbers', {
          params: {
            ...this.format,
            q: this.searchQ,
          }
        });
        const { data: lids } = await this.$axios.get('/admin/lids/serialNumbers', {
          params: {
            ...this.format,
            q: this.searchQ,
          }
        });
        if (this.searchQ) {
          this.isLoad = false;
        } else {
          this.isLoad = true;
          if (cups.length < this.format.offset || lids < this.format.offset) this.isLoad = false;
        }
        this.cupSerialNumbers = cups;
        this.lidSerialNumbers = lids;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
  }
}
</script>
