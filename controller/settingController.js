const { ServiceTime } = require("../models/Setting");
const moment = require("moment-timezone");

const Status = Object.freeze({
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  MAINTENANCE: "MAINTENANCE",
});

const workerServiceTime = async (req, res) => {
  try {
    const setting = await ServiceTime.findOne();
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Service time setting not found",
      });
    }

    const now = moment().tz("Asia/Bangkok");
    const openTime = moment(setting.open_time, "HH:mm");
    const closeTime = moment(setting.close_time, "HH:mm");
    const nextDayOpenTime = moment(setting.open_time, "HH:mm").add(1, "days");

    if (setting.is_maintenance) {
      setting.status = "MAINTENANCE";
    } else {
      if (
        (setting.is_open_early && now.isBefore(openTime)) ||
        now.isBetween(openTime, closeTime, null, "[]") ||
        (setting.is_extended_hours && now.isAfter(closeTime))
      ) {
        setting.status = "OPEN";
      } else {
        setting.status = "CLOSED";
      }

      if (
        setting.is_close_early &&
        now.isAfter(openTime) &&
        now.isBefore(closeTime)
      ) {
        setting.status = "CLOSED";
      }

      if (now.isAfter(nextDayOpenTime)) {
        setting.is_open_early = false;
        setting.is_close_early = false;
        setting.is_extended_hours = false;
      }
    }

    await setting.save();

    return res.status(200).json({
      success: true,
      message: "Service time status updated successfully",
      data: setting,
      now: now.format("HH:mm"),
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

    if (open_time !== undefined) setting.open_time = open_time;
    if (close_time !== undefined) setting.close_time = close_time;
    // if (is_maintenance !== undefined) setting.is_maintenance = is_maintenance;
    // if (is_available !== undefined) setting.is_available = is_available;
    // if (status !== undefined) setting.status = status;

    await setting.save();
    return res.status(200).json({
      success: true,
      data: setting,
      message: "Update service time successfully",
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

    return res.status(200).json({
      success: true,
      data: setting,
      message: "Update service time successfully",
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

    if (settingStatus.toUpperCase() === Status.OPEN) {
      setting.status = Status.OPEN;
      setting.is_close_early = false;
      if (now.isBefore(openTime)) {
        setting.is_open_early = true;
      } else if (now.isAfter(closeTime)) {
        setting.is_extended_hours = true;
      }
    } else if (settingStatus.toUpperCase() === Status.CLOSED) {
      setting.status = Status.CLOSED;
      setting.is_open_early = false;
      if (now.isAfter(openTime) && now.isBefore(closeTime)) {
        setting.is_close_early = true;
      }
      setting.is_extended_hours = false;
    } else if (settingStatus.toUpperCase() === Status.MAINTENANCE) {
      setting.status = Status.MAINTENANCE;
    }

    await setting.save();

    return res.status(200).json({
      success: true,
      data: setting,
      message: "Toggle service time successfully",
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
