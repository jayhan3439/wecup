export default function ({ $axios, app, route }) {
  const { path } = route;
  let tokenKey = 'token';
  if (path.indexOf('/admin') > -1) {
    tokenKey = 'admintoken';
  }
  $axios.onRequest((config) => {
    if (config.method === 'options') config.progress = false;
    const token = app.$cookies.get(tokenKey);
    if (token) config.headers.common.Authorization = `Bearer ${token}`;
  });
  $axios.onError((error) => {
    console.log(error.response);
    // if (error.response && error.response.status === 401) redirect('/clearData');
  });
}
