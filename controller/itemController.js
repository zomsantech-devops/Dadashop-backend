const Item = require("../models/Item");
const axios = require("axios");

const scheduledTask = () => {
  const now = new Date();
  console.log(`Cron job executed at ${now.toLocaleString()}`);
};

const getItemDetail = async (req, res) => {
  const itemId = req.params.itemId;

  try {
    const response = await axios.get(
      `https://fortniteapi.io/v2/items/get?id=${itemId}&lang=en`,
      {
        headers: {
          accept: "application/json",
          Authorization: "3945fead-522037f0-427f0ece-efeb4a37",
        },
      }
    );

    console.log(response.data);

    if (!response.data || !response.data.item) {
      return res
        .status(400)
        .json({ success: false, message: "Item not found" });
    }
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error fetching data from API or Redis:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
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
      extractedItems.push({
        id: shopItem.mainId,
        type_id: shopItem.displayType,
        type_name: shopItem.mainType,
        name: shopItem.displayName,
        description: shopItem.displayDescription,
        rarity_id: shopItem.rarity.id,
        rarity_name: shopItem.rarity.name,
        images_texture_background: shopItem.displayAssets[0].background_texture,
        images_item: shopItem.displayAssets[0].url,
        images_background: shopItem.displayAssets[0].background,
        images_full_background: shopItem.displayAssets[0].full_background,
        section_name: shopItem.section.name,
        finalPrice: shopItem.price.finalPrice,
        time_fetch,
        time_update,
        uid_update,
      });
    });

    for (let item of extractedItems) {
      await Item.create(item);
      console.log(extractedItems);
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
    res.status(400).json({
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
  getItemDetail,
};
