import Vue from 'vue';
import * as VueGoogleMaps  from 'vue2-google-maps';

export default () => {
  Vue.use(VueGoogleMaps , {
    load: {
      key: 'AIzaSyDC_QCB_Xvuyeztx3W3C9H8ja7jk8Rbqd0',
      v: 3.38
    },
  });
};
