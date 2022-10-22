<style lang="less" scoped>
  .rental-wrap {
    overflow-x: hidden;
    padding: 20px;
    position: relative;

    .rental-background-image {
      width: 240px;
      height: 240px;
      position: absolute;
      top: -120px;
      right: -100px;
      z-index: -1;
      background-image: url('~@/assets/rental-background-image.png');
      background-size: cover;
      background-repeat: no-repeat;
    }
    #header-nav {
      z-index: 2;
      padding: 19px 20px;
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      background-color: #FFFFFF;
    }
    .wecup {
      display: inline;
    }
    .search-input-group {
      margin-top: 46px;
      display: flex;
      flex-direction: column;
    }
    .name-search-input-frame {
      position: relative;
      width: 100%;
      height: 56px;
      margin-bottom: 20px;
    }
    .name-search-input {
      position: absolute;
      width: 100%;
      height: 56px;
      padding: 19px 24px;
      border-radius: 56px;
      border: 0;
      font-weight: 400;
      font-size: 15px;
      line-height: 120%;
      color: #433A36;
      box-sizing: border-box;
      background-color: #F5F8FA;
      background-size: 24px 24px;
      background-image: url(@/assets/icon-search-grey.png);
      background-position: center right 20px;
      background-repeat: no-repeat;
      &::placeholder {
        color: #C8C8C8;
      }
    }
    .el-date-picker-frame {
      display: flex;
      background-color: hsl(204, 33%, 97%);
      border-radius: 56px;
      padding-right: 20px;
    }
    .left-picker {
      width: 40%;
      padding: 0 0 0 24px;
    }
    .right-picker {
      width: 60%;
      padding: 0;
    }
    .hyphen {
      display: flex;
      align-items: center;
      margin: 0 16px 0 0;
      color: #c8c8c8;
      text-align: center;
      font-weight: 400;
      font-size: 15px;
      line-height: 120%;
    }
    .cancel-icon-frame {
      min-width: 24px;
      height: 24px;
      margin: auto  6px auto 0;
    }
    .cancel-icon {
      width: 24px;
      height: 24px;
    }
    .calendar-icon-frame {
      margin: auto 0;
      min-width: 24px;
      max-width: 24px;
      min-height: 24px;
      max-height: 24px;
      background-image: url(@/assets/icon-calendar-grey.png);
      background-size: 24px 24px;
      background-repeat: no-repeat;
    }
    .my-info-wrap {
      margin-top: 30px;
      margin-bottom: 30px;
      padding: 16px;
      border-radius: 20px;
      box-shadow: 0px 6px 20px rgba(20, 64, 94, 0.1);
      background-color: #FFFFFF;

      .top-info {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .phone-number {
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
        }
        .bold-number {
          display: inline;
          font-weight: 700;
        }
        .logout-button {
          padding: 6px 12px;
          font-weight: 700;
          font-size: 12px;
          line-height: 16px;
          border-radius: 10px;
          background-color: #F5F8FA;
        }
      }

      .cup-and-lid {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;

        .cup-info {
          border-right: 1px solid #EBEEF0;
        }
        .info-group{
          display: flex;
          flex: 5;
          flex-direction: column;
          align-items: center;
        }
        .info-icon {
          margin-bottom: 6px;
          width: 40px;
          height: 40px;
        }
      }
    }
  }
  /deep/ .el-date-editor {
    width: 100%;
  }
  /deep/.el-input__inner {
    height: 56px !important;
    padding: 19px 0;
    background-color: unset;
    border: 0;
    border-radius: 56px;
  }
  /deep/.el-input__prefix {
    display: none;
  }
  /deep/.el-input__icon {
    display: none;
  }
</style>

<template lang="pug">
.rental-wrap
  .rental-background-image
  #header-nav
    .body1-regular #[.body1-bold.wecup 위컵] 나의 대여 현황
  .search-input-group
    .name-search-input-frame
      input.name-search-input(type="text", placeholder="카페명으로 검색", @keyup.enter="nameSearch" @click="nameSearch")
    .el-date-picker-frame
      el-date-picker.left-picker(
        :editable="false"
        v-model="startDate"
        type="date"
        placeholder="시작일"
        prefix-icon=false
        format="yyyy/MM/dd"
        @change="nameSearch")
      p.hyphen -
      el-date-picker.right-picker(
        :editable="false"
        v-model="endDate"
        type="date"
        placeholder="종료일"
        format="yyyy/MM/dd"
        @change="nameSearch")
      .cancel-icon-frame
        img.cancel-icon(v-if="startDate !== '' || endDate !== '' ", src="@/assets/icon-close-circle.png" @click="cancelButton")
      .calendar-icon-frame
  .my-info-wrap
    .top-info
      .phone-number #[.bold-number {{ me.phoneNumber }}] 님
      .logout-button(@click="logout") 로그아웃
    .cup-and-lid
      .cup-info.info-group
        img.info-icon(src="~@/assets/cup-icon.png")
        .count.h2 {{ rentals.cupQuantity }}개
      .lid-info.info-group
        img.info-icon(src="~@/assets/lead-icon.png")
        .count.h2 {{ rentals.lidQuantity }}개

  .logs(v-for="logs in sameDate")
    rental-log(
      v-for="(log, index) in logs"
      :key="index"
      :log="log"
    )

</template>

<script>
import RentalLog from './.components/RentalLog.vue';
import { chain } from "lodash";
import moment from 'moment';
moment.locale('ko');

export default {
  name: "Rental",
  async asyncData({ app, route }) {
    const phoneNumber = route.query.phoneNumber;
    const { data: rentals } = await app.$axios.get('/user/my-rentals', {
      params: {
        phoneNumber: route.query.phoneNumber,
      }
    });
    const { data: myLogs } = await app.$axios.get('/user/user-logs/me', {
      params: {
        phoneNumber: route.query.phoneNumber,
      }
    });
    const { data: me } = await app.$axios.get('/user/me', {
      params: {
        phoneNumber: route.query.phoneNumber,
      }
    });
    let sameDate = myLogs;

    sameDate = sameDate.map((s) => ({
      ...s,
      formattedDate: moment(s.createdAt).format("YYYY-MM-DD")
    }));

    sameDate = chain(sameDate)
      .groupBy((s) => s.formattedDate)
      .map((key) => ({ date: key }))
      .value();
    return { phoneNumber, rentals, myLogs, sameDate, me };
  },
  data() {
    return {
      q: '',
      startDate: '',
      endDate: '',
    };
  },
  mounted() {
    window.onscroll = function scrollFunction() {
      if (document.body.onscrollTop > 10 || document.documentElement.scrollTop > 10) {
        document.getElementById('header-nav').style.backgroundColor = '#FFFFFF';
      } else {
        document.getElementById('header-nav').style.backgroundColor = 'transparent';
      }
    };
  },
  components: {
    RentalLog,
  },
  methods: {
    async nameSearch($event) {
      if ((!this.startDate && this.endDate) || (this.startDate && !this.endDate)) {
        return;
      }
      if($event.target === undefined) {
        // this.q = '';
      } else {
        this.q = $event.target.value;
      }
      try {
        const { data } =  await this.$axios.get('/user/user-logs/me', {
          params: {
            phoneNumber: this.phoneNumber,
            q: this.q,
            from: this.startDate,
            to: this.endDate,
          }
        });
        console.log(this.myLogs);
        this.sameDate = data;

        this.sameDate = this.sameDate.map((s) => ({
          ...s,
          formattedDate: moment(s.createdAt).format("YYYY-MM-DD")
        }));

        this.sameDate = chain(this.sameDate)
          .groupBy((s) => s.formattedDate)
          .map((key) => ({ date: key }))
          .value();

      } catch (e) {
        console.log(e)
      }
    },
    async cancelButton() {
      this.startDate = '';
      this.endDate = '';

      if (this.q) {
        try {
          const { data } =  await this.$axios.get('/user/user-logs/me', {
            params: {
              phoneNumber: this.phoneNumber,
              q: this.q,
            }
          });
          console.log(this.myLogs);
          this.sameDate = data;

          this.sameDate = this.sameDate.map((s) => ({
            ...s,
            formattedDate: moment(s.createdAt).format("YYYY-MM-DD")
          }));

          this.sameDate = chain(this.sameDate)
            .groupBy((s) => s.formattedDate)
            .map((key) => ({ date: key }))
            .value();

        } catch (e) {
          console.log(e)
        }
      }
    },
    logout() {
      window.location.href = '/pin-code';
    },
  }
}
</script>
