const Item = require("../models/Item");
const axios = require("axios");

const scheduledTask = () => {
  const now = new Date();
  console.log(`Cron job executed at ${now.toLocaleString()}`);
};

const fetchAndStoreData = async () => {
  try {
    const response = await axios.get("https://fortniteapi.io/v2/shop", {
      headers: {
        accept: "application/json",
        Authorization: "40cb2d55-3b4133d9-f1708ca0-0f179353",
      },
      params: {
        lang: "en",
        includeRenderData: true,
        includeHiddenTabs: false,
      },
    });
    if (!response || !response.data || !response.data.shop) {
      throw new Error("No data returned from the API");
    }

    const data = response.data;

    if (!data || !data.shop) {
      throw new Error("No data returned from the API");
    }

    const time_fetch = new Date();
    const time_update = new Date(data.lastUpdate.date);
    const uid_update = data.lastUpdate.uid;

    let extractedItems = [];

    data.shop.forEach((shopItem) => {
      shopItem.granted.forEach((grantedItem) => {
        extractedItems.push({
          id: grantedItem.id,
          type_id: grantedItem.type.id,
          type_name: grantedItem.type.name,
          name: grantedItem.name,
          description: grantedItem.description,
          rarity_id: grantedItem.rarity.id,
          images_background: grantedItem.images.background,
          images_full_background: grantedItem.images.full_background,
          finalPrice: null,
          time_fetch,
          time_update,
          uid_update,
        });
      });
    });

    extractedItems.forEach((item) => {
      const matchingElement = data.shop.find(
        (shopItem) =>
          shopItem.displayName === item.name ||
          shopItem.displayType === item.type_name
      );

      if (matchingElement) {
        item.finalPrice = matchingElement.price.finalPrice;
      }
    });

    for (let item of extractedItems) {
      await Item.create(item);
      console.log(item);
    }
    return { time_update };
  } catch (err) {
    console.log("ERROR : ", err);
    throw err;
  }
};

const initialize = async (req, res) => {
  await Item.deleteMany({});
  const response = await fetchAndStoreData();

  res.json({
    success: true,
    time: response,
  });
};

const getItems = async (req, res) => {
  const allItems = await Item.find({});

  if (!allItems) {
    res.status(500).json({
      success: false,
      message: "Items not found",
    });
  }

  res.json({
    success: true,
    message: allItems,
  });
};

const dailyCheckUpdatedItem = async (req, res) => {
  scheduledTask();
  try {
    const response = await axios.get("https://fortniteapi.io/v2/shop", {
      headers: {
        accept: "application/json",
        Authorization: "40cb2d55-3b4133d9-f1708ca0-0f179353",
      },
      params: {
        lang: "en",
        includeRenderData: true,
        includeHiddenTabs: false,
      },
    });

    const latestItem = await Item.findOne().sort({ time_update: -1 });
    const currentTimeUpdate = latestItem ? latestItem.time_update : null;

    const apiLastUpdate = new Date(response.data.lastUpdate.date);
    console.log(`API Last Update: ${apiLastUpdate}`);

    if (!currentTimeUpdate || apiLastUpdate > currentTimeUpdate) {
      console.log("Data has been changed, Updating database...");
      await Item.deleteMany({});
      await fetchAndStoreData();
    } else {
      console.log("Data hasn't changed");
    }

    res.status(200).json({
      success: true,
      message: "Update data if changed successfully",
    });
  } catch (error) {
    res.status(500);
    console.error("Error fetching data from API:", error);
  }
};

module.exports = {
  dailyCheckUpdatedItem,
  initialize,
  getItems,
};
