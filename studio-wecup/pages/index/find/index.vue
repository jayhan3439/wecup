<style lang="less" scoped>
  @media (min-width: 800px) {
    .wrap {
      max-width: 375px;
      width: 100%;
      height: 100%;
      margin: 0 auto;
      position: relative;
    }
  }
  .find-wrap {
    height: 100%;
    position: relative;
    overflow: hidden;
    background-color: #FFFFFF;

    .header-nav {
      width: calc(100% - 40px);
      display: flex;
      justify-content: space-between;
      padding: 18px 20px;
      box-shadow: 0px 6px 20px rgba(20, 64, 94, 0.1);
    }
    .map {
      display: block;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }
    .search-nav {
      display: flex;
      justify-content: center;
      width: 100%;
      position: absolute;
      top: 75px;
      z-index: 999;

      .input-wrap {
        padding: 15px 24px;
        width: 320px;
        position: relative;
        border-radius: 56px;
        box-shadow: 0px 6px 20px rgba(20, 64, 94, 0.1);
        background-color: #FFFFFF;
      }
      .search-input {
        width: 100%;
        border: none;
      }
      .search-input:focus {
        outline: none;
      }
      .search-input::placeholder {
        color: #C8C8C8;
      }
      .search-icon {
        width: 24px;
        height: 24px;
        position: absolute;
        top: 12px;
        right: 20px;
      }
    }
    .detail-box-wrap {
      padding: 0 20px;
      width: calc(100% - 40px);
      position: absolute;
      left: 50%;
      bottom: 20px;
      transform: translate(-50%, 0);
    }
    .search-result {
      height: 400px;
      position: absolute;
      top: 135px;
      left: 50%;
      transform: translate(-50%, 0);
      z-index: 999;
      overflow: scroll;
      border-radius: 20px;
      box-shadow: 0px 6px 20px rgba(20, 64, 94, 0.1);
      background-color: #FFFFFF;
    }
    .franchisees {
      border-radius: 20px;
    }
    .franchisees-wrap {
      margin: 0 20px;
      padding: 15px 0;
      width: 320px;
      border-bottom: 1px solid #EBEEF0;
    }
    .franchisees-name {
      margin-bottom: 8px;
    }
  }
</style>

<template lang="pug">
.find-wrap.wrap
  .header-nav
    .body1-bold 위컵 가맹점 찾아보기
    .body1-regular.blue-02_01(@click="geolocate") 현위치

  gmap-map.map(
    language="ko",
    ref="mapRef",
    :center="center",
    @click="outSide"
    :options="gmapOptions",
  )
    gmap-marker(
      v-for="(coordinateObj, index) in dayMarkerCoordinates",
      :key="index",
      :position="coordinateObj.location",
      :clickable="true"
      :options="announcementMarkerDetailOption[`${coordinateObj._id}`]",
      @click="detailInfo(coordinateObj)"
    )
  .search-nav
    .input-wrap
      input.search-input.body2-regular(
        placeholder="근처 상호 또는 주소 검색"
        :value="q"
        @input="event => q = event.target.value"
        @update:data="val => keyword = val"
      )
      img.search-icon(src="~@/assets/search-icon.png")

  .search-result(v-if="this.searchData")
    .franchisees(
      v-for="franchisees in this.searchData"
      :franchisees="franchisees"
    )
      .franchisees-wrap(@click="test1(franchisees)")
        .franchisees-name.body1-bold(v-if="franchisees.place_name") {{ franchisees.place_name }}
        .franchisees-name.body1-bold(v-else) {{ franchisees.address_name }}
        .address.body3-regular(v-if="franchisees.place_name") {{ franchisees.address_name }}

  .detail-box-wrap(v-if="detailDialog")
    detail.detail-box(
      :detail="selectedStore",
      :number="selectedStore.callNumber"
    )
</template>

<script>
import Detail from './.components/Detail.vue';
import _ from 'lodash';

const markerBar = require('~/assets/default-marker.png');
export default {
  name: "Find",
  components: {
    Detail
  },
  data() {
    return {
      gmapOptions: {
        autobindAllEvents: false,
        fullscreenControl: false,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        disableDefaultUi: false,
        gestureHandling: 'greedy',
        zoom: 16,
      },
      markerImage: {
        url: markerBar,
        size: { width: 22, height: 55, f: 'px', b: 'px'},
        scaledSize: { width: 22, height: 55, f: 'px', b: 'px'},
      },
      selectedStore: null,
      selectedStoreNumber: null,
      serach: true,
      detailDialog: false,
      center: { lat:0, lng:0 },
      currentId: null,
      nowFranchisees: null,
      test: null,
      searchData: null,
      q: '',
    }
  },
  watch: {
    async q(e) {
      this.debounceInput(e);
    },
  },
  mounted() {
    this.$refs.mapRef.$mapPromise.then((map) => {
      this.geolocate();
    });
  },
  computed: {
    dayMarkerCoordinates() {
      const coordinateObjList = [];
      if (this.nowFranchisees !== null) {
        const filtered = this.nowFranchisees.filter((a) => a.location);
        filtered.forEach((activity) => {
          const { _id, location, address, name, callNumber } = activity;
          const [lng, lat] = location;
          const coordinateObj = {
            _id,
            location: { lat, lng },
            address,
            name,
            callNumber,
          };
          coordinateObjList.push(coordinateObj);
        });
      }
      return coordinateObjList;
    },
    announcementMarkerDetailOption() {
      const map = {};
      if (this.nowFranchisees !== null) {
        const filtered = this.nowFranchisees.filter((a) => a.location);
        filtered.forEach((activity) => {
          const announcementMakerObj = {
            icon: {
              url: require('~/assets/default-marker.png'),
              size: { width: 36, height: 36, f: 'px', b: 'px'},
              scaledSize: { width: 36, height: 36, f: 'px', b: 'px'},
            }
          };
          if (this.currentId === activity._id) {
            announcementMakerObj.icon.url = require('~/assets/active-marker.png');
          } else {
            announcementMakerObj.icon.url = require('~/assets/default-marker.png');
          }
          map[`${activity._id}`] = announcementMakerObj;
        });
      }
      return map;
    },
    announcementMarkerCoordinates() {
      const coordinateObjList = [];
      const filtered = this.stores.filter((a) => a.location);
      filtered.forEach((activity) => {
        const { _id, location, address, name } = activity;
        const [lng, lat] = location;
        const coordinateObj = {
          _id,
          address,
          name,
          location: { lat, lng },
        };
        coordinateObjList.push(coordinateObj);
      });
      return coordinateObjList;
    },
  },
  methods: {
    geolocate() {
      this.center.lng = this.$refs.mapRef.$mapObject.getCenter().lng(),
      this.center.lat = this.$refs.mapRef.$mapObject.getCenter().lat(),
      navigator.geolocation.getCurrentPosition(async position => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        this.center = {
          lat,
          lng,
        };
        await this.franchisees(lat, lng);
      }, error => {
        console.log(error);
      }, {timeout:10000});
    },
    async franchisees(lat, lng) {
      try {
        const { data: franchisees } = await this.$axios.get('/user/franchisees', {
          params: {
            lng: lng,
            lat: lat,
          },
        });
        this.nowFranchisees = franchisees;
      } catch (e) {
        if (e.response) this.$message.error(e.response.data.message);
      }
    },
    focusInput() {
      this.search = true;
    },
    detailInfo(val) {
      setTimeout(() => {
        this.selectedStore = val;
        this.selectedStoreNumber = val.callNumber;
        this.currentId = val._id;
        this.detailDialog = true;
      }, 100);
    },
    debounceInput: _.debounce(async function loadlocation(value) {
      this.$refs.mapRef.$mapPromise.then(async (map) => {
        try {
          const { data: result } = await this.$axios.get('/coords', {
            params: {
              query: value,
            },
          });
          let addressData = result.addressSearchData.documents;
          let keywordData = result.keywordSearchData.documents;
          let allData = addressData.concat(keywordData);
          console.log(addressData);
          console.log(keywordData);

          if (value === '') {
            this.searchData = '';
          } else {
            this.searchData = allData;
          }
        } catch (e) {
          console.log(e);
        }
      });
      // this.searchData = null;
      if (this.q === "") {
        this.searchData = null;
      }
    }, 200),

    outSide() {
      this.q = '';
      this.searchData = null;
      this.selectedStore = null;
      this.currentId = null;
      this.detailDialog = false;
    },
    async test1(val) {
      this.q = '';
      this.detailDialog = false;
      setTimeout(() => {
        this.searchData = null
        this.selectedStore = null;
        this.selectedStoreNumber = null;
      }, 200)
      this.center.lat = Number(val.y);
      this.center.lng = Number(val.x);
      try {
        const { data: result } = await this.$axios.get('/user/franchisees', {
          params: {
            lng: Number(val.x),
            lat: Number(val.y),
          },
        });
        this.nowFranchisees = result;
      } catch (e){
        if (e.response) this.$message.error(e.response.data.message);
      }
    }
  },
}
</script>
