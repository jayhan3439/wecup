const PhoneNumber = require('awesome-phonenumber');
const axios = require('axios');

const APP_KEY = 'sehkgsn3slrFBQ3r';

module.exports = async (phone, message) => {
  const pn = new PhoneNumber(phone, 'KR');
  if (!pn.isValid()) throw new error('Invaild');
  if (!pn.isMobile()) throw new error('Cannot send sms.');
  return await axios({
    method: 'post',
    url: `https://api-sms.cloud.toast.com/sms/v2.1/appKeys/${APP_KEY}/sender/sms`, 
    data: {
      body: message,
      sendNo: '01085683439',
      recipientList: [{ recipientNo: pn.getNumber('national').split('-').join('') }],
    }
  });
}