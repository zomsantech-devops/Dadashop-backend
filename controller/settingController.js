const { ExchangeRate, ServiceTime } = require("../models/Setting");

const Status = Object.freeze({
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  MAINTENANCE: "MAINTENANCE",
});

const updateServiceTime = async (req, res) => {
  try {
    const { open_time, close_time, is_maintenance, is_available, status } =
      req.body;

    const setting = await ServiceTime.findOne();
    if (!setting) {
      res.status(400).json({
        success: false,
        message: "Setting not found",
      });
    }

    if (open_time !== undefined) setting.open_time = open_time;
    if (close_time !== undefined) setting.close_time = close_time;
    if (is_maintenance !== undefined) setting.is_maintenance = is_maintenance;
    if (is_available !== undefined) setting.is_available = is_available;
    if (status !== undefined) setting.status = status;

    await setting.save();
    res.status(200).json({
      success: true,
      data: setting,
      message: "Update service time successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getServiceTime = async (req, res) => {
  try {
    const setting = await ServiceTime.findOne();
    if (!setting) {
      res.status(400).json({
        success: false,
        message: "Setting not found",
      });
    }

    res.status(200).json({
      success: true,
      data: setting,
      message: "Update service time successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const toggleServiceTime = async (req, res) => {
  try {
    const { settingStatus } = req.params;
    console.log(req);

    const setting = await ServiceTime.findOne();
    if (!setting) {
      res.status(400).json({
        success: false,
        message: "Setting not found",
      });
    }

    if (settingStatus) {
      switch (settingStatus) {
        case Status.OPEN:
          setting.status = Status.OPEN;
          break;
        case Status.CLOSED:
          setting.status = Status.CLOSED;
          break;
        case Status.MAINTENANCE:
          setting.status = Status.MAINTENANCE;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid status value",
          });
      }
    } else {
      switch (setting.status) {
        case Status.OPEN:
          setting.status = Status.CLOSED;
          break;
        case Status.CLOSED:
          setting.status = Status.MAINTENANCE;
          break;
        case Status.MAINTENANCE:
          setting.status = Status.OPEN;
          break;
      }
    }

    await setting.save();

    res.status(200).json({
      success: true,
      data: setting,
      message: "Toggle service time successfully",
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const everyHalfHourlyServiceTime = async (req, res) => {
  //
};

module.exports = {
  toggleServiceTime,
  updateServiceTime,
  getServiceTime,
};
