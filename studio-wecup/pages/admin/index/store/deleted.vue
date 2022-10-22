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

  .juso-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background-color: transparent;
  }
  .juso-container {
    width: 500px;
    height: 500px;
  }
  .juso-headers {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  .jusoClose {
    cursor: pointer;
  }
  .jusoLayout {
    height: 100%;
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
    color: #433A36;
    background-color: transparent;
  }
</style>

<template lang="pug">
.store-wrap
  .title-group
    .title.body3-bold 삭제된 가맹점 목록
  .header-group
    form.search-wrap
      input.admin-input(
        v-model="q",
        placeholder="이름, 점주명, 전화번호, 주소 검색",
      )
      button.search-button(@click.prevent="search") 검색

  el-table.table(
    :data="franchisees"
  )
    el-table-column(
      label="가맹점 일련번호",
      prop="_id",
    )
    el-table-column(
      label="가맹점명",
      prop="name"
    )
    el-table-column(
      label="주소",
      prop="address",
    )
    el-table-column(
      label="현재 재고(컵)",
      prop="cupQuantity.quantity"
    )
    el-table-column(
      label="현재 재고(리드)",
      prop="lidQuantity.quantity"
    )
    el-table-column(
      label="매장 전화번호",
      prop="callNumber"
    )
    el-table-column(
      label="가맹점주명",
      prop="ownerName"
    )
    el-table-column(
      label="점주 전화번호",
      prop="ownerPhoneNumber"
    )
    el-table-column(
      label="내역",
    )
      template(slot-scope="scope")
        .edit(@click="history(scope.row._id)") 내역
    el-table-column(
      label="출입고",
    )
      template(slot-scope="scope")
        .edit(@click="stock(scope.row._id)") 출입고
    el-table-column(
      label="수정",
    )
      template(slot-scope="scope")
        .edit(@click="openEdit(scope.row._id)") 수정
    el-table-column(
      label="수정",
    )
      template(slot-scope="scope")
        .edit(@click="openRestore(scope.row._id)") 복원
  .more-load(
    v-if="isLoad"
    @click="moreLoad"
  ) 더 불러오기

  el-dialog.new-dialog(
    :visible.sync="newDialogVisible",
    @closed="closeDialog"
  )
    new-store(
      @jusoOpen="jusoOpen",
      @save="save",
      @newStoreClose="newStoreClose",
      :form="form",
      :address="address",
      :location="location",
      :randomStr="randomStr"
    )
  el-dialog.edit-dialog(
    :visible.sync="editDialogVisible",
    @closed="closeDialog"
  )
    edit-store(
      @jusoOpen="jusoOpen",
      @edit="edit",
      @editStoreClose="editStoreClose",
      @deleteStore="deleteStore",
      :form="form",
      :address="address",
      :location="location"
    )
  el-dialog.restore-dialog(
    :visible.sync="restoreDialogVisible",
  )
    .alert-text.body3-bold.black-01 복원하시겠습니까?
      .button-wrap
        button.process-button.cancel-button(@click="cancelRestore") 취소
        button.process-button(@click="restore") 확인

  .juso-wrap(v-if="isJusoOpen")
    .juso-container
      .juso-headers
        img.jusoClose(
          src="//t1.daumcdn.net/postcode/resource/images/close.png"
          id="btnCloseLayer"
          @click="closeDaumPostcode"
          alt="닫기 버튼")
      div.jusoLayout(
        id="layer"
        style="width: 100%;")
</template>

<script>
import NewStore from './.components/NewStore.vue';
import EditStore from './.components/EditStore.vue';

export default {
  name: "Deleted",
  async asyncData({ app }) {
    const format = {
      offset: 0,
      limit: 50,
    };
    const { data: franchisees } = await app.$axios.get('/admin/franchisees', {
      params: {
        deleted: true,
        ...format,
      },
    });
    let isLoad = true;
    if (franchisees.length < 50) isLoad = false;
    return { franchisees, isLoad, format };
  },
  components: {
    NewStore,
    EditStore,
  },
  data() {
    return {
      q: '',
      value: '',
      randomStr: null,
      form: {
        name: '',
        username: '',
        password: '',
        callNumber: '',
        ownerName: '',
        ownerPhoneNumber: '',
        detailAddress: '',
        activation: false,
      },
      selectedStore: null,
      location: null,
      address: null,
      newDialogVisible: false,
      editDialogVisible: false,
      restoreDialogVisible: false,
      isJusoOpen: false,
    }
  },
  methods: {
    async add() {
      try {
        const generateRandomString = (num) => {
          const characters ='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let result = '';
          const charactersLength = characters.length;
          for (let i = 0; i < num; i++) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
          }
          return result;
        }
        let randomStr = generateRandomString(6);
        const { data: serialNumber } = await this.$axios.get(`/admin/franchisees/${randomStr}/exists`)
        if(serialNumber.usedSerialNumber === false) {
          this.randomStr = randomStr;
        }
        this.newDialogVisible = true;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    newStoreClose() {
      this.newDialogVisible = false;
    },
    jusoOpen() {
      this.isJusoOpen = true;
      setTimeout(() => {
        const element = document.getElementById('layer');
        const borderWidth = 2;
        element.style.border = `${borderWidth}px solid`;
        new daum.Postcode({
          oncomplete: async (data) => {
            const { data: result } = await this.$axios.get('/coords', {
              params: {
                query: data.address,
              },
            })
            console.log(result);
            this.location = [Number(result.addressSearchData.documents[0].x), Number(result.addressSearchData.documents[0].y)];
            this.address = data.address;
            this.closeDaumPostcode();
          },
          width: '100%',
          height: '100%',
        }).embed(element);
        element.style.display = 'block';
      }, 500);
    },
    closeDaumPostcode() {
      this.isJusoOpen = false;
      const element = document.getElementById('layer');
      element.style.display = 'none';
    },
    async search() {
      try {
        const { data: result } = await this.$axios.get('/admin/franchisees', {
          params: {
            deleted: true,
            q: this.q,
          }
        });
        this.franchisees = result;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async moreLoad() {
      this.format.offset += 50;
      try {
        const { data: result } = await this.$axios.get('/admin/franchisees', {
          params: {
            q: this.q,
            deleted: true,
            ...this.format,
          },
        });
        if (result.length < 50) this.isLoad = false;
        this.franchisees = this.franchisees.concat(result);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async save() {
      try {
        await this.$axios.post('/admin/franchisees', {
          ...this.form,
          address: this.address,
          serialNumber: this.randomStr,
          location: this.location,
        });
        this.$message.success('저장 되었습니다.');
        this.newDialogVisible = false;
        setTimeout(async () => {
          const { data: franchisees } = await this.$axios.get('/admin/franchisees', {
            params: {
              sort: this.sort,
              ...this.format,
            },
          });
          this.franchisees = franchisees;
        }, 300);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async openEdit(val) {
      this.editDialogVisible = true;
      try {
        const { data: storeData } = await this.$axios.get(`/admin/franchisees/${val}`);
        this.form = storeData;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    editStoreClose() {
      this.editDialogVisible = false;
    },
    async edit(){
      this.form.address = this.address;
      try {
        await this.$axios.put(`/admin/franchisees/${this.form._id}`, {
          ...this.form,
        });
        this.$message.success('수정 되었습니다.');
        this.editDialogVisible = false;
        setTimeout(async () => {
          const { data: franchisees } = await this.$axios.get('/admin/franchisees', {
            params: {
              deleted: true,
              ...this.format,
            },
          });
          this.franchisees = franchisees;
        }, 200);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    async openRestore(val) {
      this.selectedStore = val;
      this.restoreDialogVisible = true;
    },
    cancelRestore() {
      this.restoreDialogVisible = false;
    },
    async restore() {
      try {
        await this.$axios.put(`/admin/franchisees/${this.selectedStore}`, {
          hidden: false,
        });
        this.$message.success('복원 되었습니다.');
        this.restoreDialogVisible = false;
        setTimeout(async () => {
          const { data: franchisees } = await this.$axios.get('/admin/franchisees', {
            params: {
              deleted: true,
              ...this.format,
            },
          });
          this.franchisees = franchisees;
        }, 200);
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    closeDialog() {
      this.form = {
        name: '',
        username: '',
        password: '',
        callNumber: '',
        ownerName: '',
        ownerPhoneNumber: '',
        detailAddress: '',
        activation: false,
      };
    },
    history(val) {
      const replacePath = `?history=${val}`;
      this.$router.push({ path: `/admin/detail${replacePath}`, query: { history: val } });
    },
    stock(val) {
      const replacePath = `?stock=${val}`;
      this.$router.push({ path: `/admin/management${replacePath}`, query: { stock: val } });
    }
  }
}
</script>
