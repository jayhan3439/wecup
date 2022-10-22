const PhoneNumber = require('awesome-phonenumber');
const axios = require('axios');

const appKey = 'KGKJv72XvGZJpDjz';
const secretKey = '87It1Q5B';

module.exports = async (phone, template, substitutions) => {
  try {
    const pn = new PhoneNumber(phone, 'KR');
    if (!pn.isValid()) throw new Error('Invaild');
    if (!pn.isMobile()) throw new Error('Cannot send sms.');
    return await axios({
      method: 'post',
      url: `https://api-alimtalk.cloud.toast.com/alimtalk/v1.5/appkeys/${appKey}/messages`,
      headers: {
        'X-Secret-Key': secretKey,
        'Content-Type': 'application/json'
      },
      data: {
        plusFriendId: '@위컵',
        templateCode: template,
        recipientList: [{ 
          recipientNo: pn.getNumber('national').split('-').join(''),
          templateParameter: substitutions
        }],
      }
    });
  } catch (error) {
    console.log("error :>> ", error);
  }
};