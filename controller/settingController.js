const { ServiceTime } = require("../models/Setting");
const moment = require("moment-timezone");

const Status = Object.freeze({
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  MAINTENANCE: "MAINTENANCE",
});

const serviceTime = async () => {
  try {
    const setting = await ServiceTime.findOne();

    const now = moment().tz("Asia/Bangkok");
    const openTime = moment(setting.open_time, "HH:mm");
    const closeTime = moment(setting.close_time, "HH:mm");

    if (setting.is_maintenance) {
      setting.status = Status.MAINTENANCE;
    } else {
      if (
        setting.is_close_early &&
        (now.isAfter(openTime) || now.isBefore(closeTime))
      ) {
        setting.status = Status.CLOSED;
      } else if (
        setting.is_open_early ||
        // (setting.is_open_early && now.isBefore(openTime)) ||
        now.isBetween(openTime, closeTime, null, "[]") ||
        setting.is_extended_hours
        // (setting.is_extended_hours && now.isAfter(closeTime))
      ) {
        setting.status = Status.OPEN;
      } else {
        setting.status = Status.CLOSED;
      }
      // if (now.isAfter(nextDayOpenTime)) {
      //   setting.is_open_early = false;
      //   // after today close

      //   setting.is_close_early = false;
      //   // before today open

      //   setting.is_extended_hours = false;
      //   // after today open && before today close
      // }

      if (now.isBefore(openTime)) {
        setting.is_close_early = false;
      } else if (now.isAfter(closeTime)) {
        setting.is_open_early = false;
      } else if (now.isAfter(openTime) && now.isBefore(closeTime)) {
        setting.is_extended_hours = false;
      }

      await setting.save();
    }

    await setting.save();

    return setting;
  } catch (error) {
    throw new Error(error.message);
  }
};

const workerServiceTime = async (req, res) => {
  try {
    const setting = await serviceTime();

    const now = moment().tz("Asia/Bangkok");

    return res.status(200).json({
      success: true,
      message: "Service time status updated successfully",
      data: setting,
      now,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateServiceTime = async (req, res) => {
  try {
    const { open_time, close_time, is_maintenance, is_available, status } =
      req.body;

    const setting = await ServiceTime.findOne();
    if (!setting) {
      return res.status(400).json({
        success: false,
        message: "Setting not found",
      });
    }

    setting.is_open_early = false;
    setting.is_close_early = false;
    setting.is_extended_hours = false;

    if (open_time !== undefined) setting.open_time = open_time;
    if (close_time !== undefined) setting.close_time = close_time;
    // if (is_maintenance !== undefined) setting.is_maintenance = is_maintenance;
    // if (is_available !== undefined) setting.is_available = is_available;
    // if (status !== undefined) setting.status = status;

    await setting.save();

    const settings = await serviceTime();

    const now = moment().tz("Asia/Bangkok");

    return res.status(200).json({
      success: true,
      data: settings,
      message: "Update service time successfully",
      now,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const getServiceTime = async (req, res) => {
  try {
    const setting = await ServiceTime.findOne();
    if (!setting) {
      return res.status(400).json({
        success: false,
        message: "Setting not found",
      });
    }

    const now = moment().tz("Asia/Bangkok");
    const beforeNow = moment();

    return res.status(200).json({
      success: true,
      data: setting,
      message: "Update service time successfully",
      now,
      beforeNow,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const toggleServiceTime = async (req, res) => {
  try {
    const { settingStatus } = req.params;

    const setting = await ServiceTime.findOne();
    if (!setting) {
      return res.status(400).json({
        success: false,
        message: "Setting not found",
      });
    }

    const now = moment().tz("Asia/Bangkok");
    const openTime = moment(setting.open_time, "HH:mm");
    const closeTime = moment(setting.close_time, "HH:mm");

    setting.is_open_early = false;
    setting.is_close_early = false;
    setting.is_extended_hours = false;

    if (settingStatus.toUpperCase() === Status.OPEN) {
      setting.status = Status.OPEN;
      if (now.isBefore(openTime)) {
        setting.is_open_early = true;
      } else if (now.isAfter(closeTime)) {
        setting.is_extended_hours = true;
      }
    } else if (settingStatus.toUpperCase() === Status.CLOSED) {
      setting.status = Status.CLOSED;
      if (now.isAfter(openTime) || now.isBefore(closeTime)) {
        setting.is_close_early = true;
      }
    } else if (settingStatus.toUpperCase() === Status.MAINTENANCE) {
      if (setting.is_maintenance) {
        setting.is_maintenance = false;
      } else {
        setting.status = Status.MAINTENANCE;
        setting.is_maintenance = true;
      }
    }

    await setting.save();

    const settings = await serviceTime();

    return res.status(200).json({
      success: true,
      data: settings,
      message: "Toggle service time successfully",
      now,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  toggleServiceTime,
  updateServiceTime,
  getServiceTime,
  workerServiceTime,
};
