const { Router } = require('express');
const router = Router();
const axios = require('axios');
const APP_KEY = '013d11cfe47979f248e26678c674212e';

router.get('/coords', async (req, res) => {
  const { query } = req.query;
  const addressApiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`
  const keywordApiUrl = `https://dapi.kakao.com//v2/local/search/keyword.json?query=${encodeURIComponent(query)}`
  try {
    const addressData = await axios({
      method: 'get',
      url: addressApiUrl,
      headers: {
        Authorization: `KakaoAK ${APP_KEY}`
      },
      responseType: 'json'
    })
    const keywordData = await axios({
      method: 'get',
      url: keywordApiUrl,
      headers: {
        Authorization: `KakaoAK ${APP_KEY}`
      },
      responseType: 'json'
    })
    if ((!addressData && keywordData) || (!addressData.data && keywordData.data))
      return res.status(400).json({ message: '검색 실패' });
    res.json({ addressSearchData: addressData.data, keywordSearchData: keywordData.data});
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
})

module.exports = router;