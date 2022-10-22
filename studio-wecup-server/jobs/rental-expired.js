const { UserLog, User } = require("../models");

let running = false;
setInterval(async () => {
  if (running) return;
  running = true;
  const now = new Date();
  const userCupLogs = await UserLog.aggregate()
    .match({ canceled: { $ne: true } })
    .sort('-createdAt')
    .group({
      _id: '$cupSerialNumber',
      logId: { $first: '$_id' },
      type: { $first: '$type' },
      userPhoneNumber: { $first: '$userPhoneNumber' },
      expiredAt: { $first: '$expiredAt' }
    })
    .match({
      expiredAt: { $lt: now },
      type: 'rental'
    })
  for (const c of userCupLogs) {
    await User.updateOne({ phoneNumber: c.userPhoneNumber }, { overdue: true }, { strict: true });
    await UserLog.updateOne({ _id: c.logId }, { overdue: true }, { strict: true });
  }

  const userLidLogs = await UserLog.aggregate()
    .match({ canceled: { $ne: true } })
    .sort('-createdAt')
    .group({
      _id: '$lidSerialNumber',
      logId: { $first: '$_id' },
      type: { $first: '$type' },
      userPhoneNumber: { $first: '$userPhoneNumber' },
      expiredAt: { $first: '$expiredAt' }
    })
    .match({
      expiredAt: { $lt: now },
      type: 'rental'
    })
  for (const c of userLidLogs) {
    await User.updateOne({ phoneNumber: c.userPhoneNumber }, { overdue: true }, { strict: true });
    await UserLog.updateOne({ _id: c.logId }, { overdue: true }, { strict: true });
  }
  running = false;
}, 1000 * 60);