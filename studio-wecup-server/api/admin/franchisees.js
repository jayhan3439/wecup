const { Router } = require('express');
const AwesomePhoneNumber = require('awesome-phonenumber');
const router = Router();
const authorize = require('../../helpers/admin-authorize');
const { Franchisee, FranchiseeCup, FranchiseeLid, WecupCup, WecupLid } = require('../../models');
const wregexp = require('../../helpers/wregexp');

router.post('/franchisees', authorize(), async (req, res) => {
  const {
    serialNumber,
    name,
    address,
    detailAddress,
    callNumber,
    ownerName,
    ownerPhoneNumber,
    username,
    password,
    location,
    activation
  } = req.body;
  try {
    const existsUsername = await Franchisee.findOne({ username })
      .select('_id');
    if (existsUsername)
      return res.status(400).json({ message: '이미 등록된 아이디 입니다.' });

    const existsSerialNumber = await Franchisee.findById(serialNumber)
      .select('_id');
    if (existsSerialNumber)
      return res.status(400).json({ message: '이미 등록된 일련번호 입니다.' });

    const cn = new AwesomePhoneNumber(callNumber, 'KR');
    if (cn.isValid() === false)
      return res.status(400).json({ message: '유효하지 않은 연락처입니다.' });

    const pn = new AwesomePhoneNumber(ownerPhoneNumber, 'KR');
    if (pn.isValid() === false || pn.isMobile() === false)
      return res.status(400).json({ message: '유효하지 않은 연락처입니다.' });
    const franchisee = await new Franchisee({
      _id: serialNumber,
      name,
      address,
      detailAddress,
      callNumber: cn.getNumber('national').split('-').join(''),
      ownerName,
      ownerPhoneNumber: pn.getNumber('national').split('-').join(''),
      username,
      password,
      location,
      activation
    }).save();
    await new FranchiseeCup({
      franchiseeId: franchisee._id
    }).save();
    await new FranchiseeLid({
      franchiseeId: franchisee._id
    }).save();
    res.status(201).json(franchisee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/franchisees', authorize(), async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 1000);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const { q, deleted } = req.query;
  const sort = req.query.sort || '-createdAt';
  try {
    const query = Franchisee.find()
      .populate([
        { path: 'cupQuantity', model: 'FranchiseeCup', select: '-_id -franchiseeId quantity' },
        { path: 'lidQuantity', model: 'FranchiseeLid', select: '-_id -franchiseeId quantity' },
      ])
      .skip(offset)
      .limit(limit)
      .sort(sort);
    if (q) {
      query.or([
        { name: wregexp(q) },
        { ownerName: wregexp(q) },
        { callNumber: wregexp(q) },
        { address: wregexp(q) },
        { detailAddress: wregexp(q) }
      ]);
    }
    if (deleted === 'true')
      query.where('hidden').equals(true);
    else
      query.where('hidden').ne(true);
    res.json(await query); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/franchisees/:serialNumber/exists', authorize(), async (req, res) => {
  const serialNumber = req.params.serialNumber;
  try {
    const existsSerialNumber = await Franchisee.findOne({ _id: serialNumber })
      .select('_id');
    if (!existsSerialNumber)
      return res.json({ usedSerialNumber: false });
    res.json({ usedSerialNumber: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/franchisees/:_id', authorize(), async (req, res) => {
  const _id = req.params._id;
  try {
    const franchisee = await Franchisee.findById(_id);
    if (!franchisee)
      return res.status(404).json({ message: '가맹점 정보를 찾을 수 없습니다.' });
    res.json(franchisee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/franchisees/:_id', authorize(), async (req, res) => {
  const _id = req.params._id;
  const {
    name,
    address,
    detailAddress,
    callNumber,
    ownerName,
    ownerPhoneNumber,
    username,
    password,
    location,
    activation,
    hidden
  } = req.body;
  try {
    const franchisee = await Franchisee.findById(_id);
    if (!franchisee)
      return res.status(404).json({ message: '가맹점 정보를 찾을 수 없습니다.' });
    
    if (name) franchisee.name = name;
    if (address) franchisee.address = address;
    if (detailAddress) franchisee.detailAddress = detailAddress;
    if (callNumber) {
      const cn = new AwesomePhoneNumber(callNumber, 'KR');
      if (cn.isValid() === false)
        return res.status(400).json({ message: '유효하지 않은 연락처입니다.' });
      franchisee.callNumber = cn.getNumber('national').split('-').join('');
    }
    if (ownerName) franchisee.ownerName = ownerName;
    if (ownerPhoneNumber) {
      const pn = new AwesomePhoneNumber(ownerPhoneNumber, 'KR');
      if (pn.isValid() === false || pn.isMobile() === false)
        return res.status(400).json({ message: '유효하지 않은 연락처입니다.' });
      franchisee.ownerPhoneNumber = pn.getNumber('national').split('-').join('');
    }
    if (username) {
      const existsFranchisee = await Franchisee.findOne({ _id: { $ne: _id }, username })
        .select('_id');
      if (existsFranchisee)
        return res.status(400).json({ message: '이미 등록된 아이디 입니다' });
      franchisee.username = username;
    }
    if (password) franchisee.password = password;
    if (location) franchisee.location = location;
    if (activation || activation === false) franchisee.activation = activation;
    if (hidden || hidden === false) franchisee.hidden = hidden;

    await franchisee.save();
    res.json(franchisee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/franchisees/:_id', authorize(), async (req, res) => {
  const _id = req.params._id;
  try {
    const franchisee = await Franchisee.findOne({ _id, hidden: { $ne: true } });
    if (!franchisee)
      return res.status(404).json({ message: '가맹점 정보를 찾을 수 없습니다.' });

    const franchiseeCup = await FranchiseeCup.findOne({ franchiseeId: _id });
    const franchiseeLid = await FranchiseeLid.findOne({ franchiseeId: _id });

    const wecupCup = await WecupCup.findById('wecup');
    const wecupLid = await WecupLid.findById('wecup');

    wecupCup.quantity += franchiseeCup.quantity;
    wecupLid.quantity += franchiseeLid.quantity;

    franchiseeCup.quantity = 0;
    franchiseeLid.quantity = 0;
    franchisee.hidden = true;

    await wecupCup.save();
    await wecupLid.save();
    await franchiseeCup.save();
    await franchiseeLid.save();
    await franchisee.save();
    res.json(franchisee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;