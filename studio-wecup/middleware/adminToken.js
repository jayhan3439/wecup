export default async function ({ app, route, store, redirect }) {
  const admintoken = app.$cookies.get('admintoken');
  if (admintoken === undefined) {
    app.$cookies.removeAll();
    return redirect('/admin/login');
  }
}
