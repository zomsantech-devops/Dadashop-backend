const Item = require("../models/Item");
const axios = require("axios");
const { kv } = require("@vercel/kv");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const cacheDir = path.join("/tmp", "cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const scheduledTask = () => {
  const now = new Date();
  console.log(`Cron job executed at ${now.toLocaleString()}`);
};

const jsonToRedis = (data) => {
  const itemResponse = JSON.stringify(data);
  const modifiedItemResponse = itemResponse.replace(/"/g, "'");
  return modifiedItemResponse;
};

const redisToJson = (data) => {
  let modifiedRes = data.replace(/\\'/g, "\\'").replace(/"/g, '\\"');
  modifiedRes = modifiedRes.replace(/'/g, '"');
  const itemResponse = JSON.parse(modifiedRes);
  return itemResponse;
};

const arrayJsonToRedis = (data) => {
  const itemResponse = JSON.stringify(data);
  const modifiedItemResponse = itemResponse.replace(/'/g, "\\'");
  return `'${modifiedItemResponse}'`;
};

const arrayRedisToJson = (data) => {
  let modifiedRes = data.substring(1, data.length - 1).replace(/\\'/g, "'");
  const itemResponse = JSON.parse(modifiedRes);
  return itemResponse;
};

const getItemDetail = async (req, res) => {
  const itemId = req.params.itemId;

  const cachePath = path.join(cacheDir, `${itemId}.json`);

  try {
    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, "utf8");
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cacheData), source: "cache" });
    }

    const response = await axios.get(
      `https://fortniteapi.io/v2/items/get?id=${itemId}&includeRenderData=true&lang=en`,
      {
        headers: {
          accept: "application/json",
          Authorization: "3945fead-522037f0-427f0ece-efeb4a37",
        },
      }
    );

    if (!response.data || !response.data.item) {
      return res
        .status(400)
        .json({ success: false, message: "Item not found" });
    }

    const mainData = response.data;

    if (mainData.item.grants && mainData.item.grants.length > 0) {
      mainData.item.grants = mainData.item.grants.map((grant) => ({
        ...grant,
        parent_id: mainData.item.id,
        parent_name: mainData.item.type.name,
        parent_price: mainData.item.price,
      }));
    }

    const fullData = {
      ...mainData,
      item: {
        ...mainData.item,
        styles: mainData.item.styles.map((style, index) => {
          const matchingVideo = mainData.item.previewVideos.find((video) =>
            video.styles.some((vStyle) => vStyle.tag === style.tag)
          );

          const videoUrl = matchingVideo
            ? matchingVideo.url
            : mainData.item.previewVideos[index]
            ? mainData.item.previewVideos[index].url
            : null;

          return {
            ...style,
            video_url: videoUrl,
          };
        }),
      },
    };

    fs.writeFileSync(cachePath, JSON.stringify(fullData), "utf8");

    return res.status(200).json({
      success: true,
      data: fullData,
      source: "database",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Can't get item detail shop right now, Please contract admin ${err.message}`,
    });
  }
};

const fetchAndStoreData = async () => {
  try {
    const response = await axios.get(
      "https://fortniteapi.io/v2/shop?includeRenderData=false&includeHiddenTabs=false",
      {
        headers: {
          accept: "application/json",
          Authorization: "40cb2d55-3b4133d9-f1708ca0-0f179353",
        },
        params: {
          lang: "en",
          includeRenderData: true,
          includeHiddenTabs: false,
        },
      }
    );

    if (!response || !response.data || !response.data.shop) {
      return res.status(400).json({
        success: false,
        message: "Fortnite api is not available right now",
      });
    }

    const data = response.data;

    const time_fetch = new Date();
    const time_update = new Date(data.lastUpdate.date);
    const uid_update = data.lastUpdate.uid;

    let extractedItems = [];

    data.shop.forEach((shopItem) => {
      let images_background =
        shopItem.displayAssets && shopItem.displayAssets[0]
          ? shopItem.displayAssets[0].background
          : null;
      let images_full_background =
        shopItem.displayAssets && shopItem.displayAssets[0]
          ? shopItem.displayAssets[0].full_background
          : null;

      if (shopItem.granted && shopItem.granted.length > 0) {
        const matchingGranted = shopItem.granted.find(
          (grantedItem) => grantedItem.id === shopItem.mainId
        );
        if (matchingGranted && matchingGranted.images) {
          images_background =
            matchingGranted.images.background || images_background;
          images_full_background =
            matchingGranted.images.full_background || images_full_background;
        }
      }

      const display_assets = shopItem.displayAssets
        ? shopItem.displayAssets.map((asset) => ({
            display_id: asset.displayAsset ? asset.displayAsset : null,
            image_url: asset.url ? asset.url : null,
            image_background: asset.background ? asset.background : null,
            image_full_background: asset.full_background
              ? asset.full_background
              : null,
            parent_id: shopItem.mainId ? shopItem.mainId : null,
            parent_final_price:
              shopItem.price && shopItem.price.finalPrice
                ? shopItem.price.finalPrice
                : null,
          }))
        : [];

      extractedItems.push({
        id: shopItem.mainId ? shopItem.mainId : null,
        type_id: shopItem.displayType ? shopItem.displayType : null,
        type_name: shopItem.mainType ? shopItem.mainType : null,
        name: shopItem.displayName ? shopItem.displayName : null,
        description: shopItem.displayDescription
          ? shopItem.displayDescription
          : null,
        rarity_id:
          shopItem.rarity && shopItem.rarity.id ? shopItem.rarity.id : null,
        rarity_name:
          shopItem.rarity && shopItem.rarity.name ? shopItem.rarity.name : null,
        images_texture_background:
          shopItem.displayAssets &&
          shopItem.displayAssets[0] &&
          shopItem.displayAssets[0].background_texture
            ? shopItem.displayAssets[0].background_texture
            : null,
        images_item:
          shopItem.displayAssets &&
          shopItem.displayAssets[0] &&
          shopItem.displayAssets[0].url
            ? shopItem.displayAssets[0].url
            : null,
        images_background: images_background,
        images_full_background: images_full_background,
        display_assets: display_assets,
        section_name:
          shopItem.section && shopItem.section.name
            ? shopItem.section.name
            : null,
        finalPrice:
          shopItem.price && shopItem.price.finalPrice
            ? shopItem.price.finalPrice
            : null,
        release_date: shopItem.firstReleaseDate
          ? shopItem.firstReleaseDate
          : null,
        time_fetch: time_fetch,
        time_update: time_update,
        uid_update: uid_update ? uid_update : null,
      });
    });

    await Item.deleteMany({});

    for (let item of extractedItems) {
      await Item.create(item);
    }

    return { time_update, data };
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Can't fetch item shop right now, Please contract admin ${err.message}`,
    });
  }
};

const initialize = async (req, res) => {
  // await Item.deleteMany({});
  const { time_update, data } = await fetchAndStoreData();

  res.json({
    success: true,
    time: time_update,
    response_success: data.result,
    response_length: data.shop.length,
  });
};

const getItems = async (req, res) => {
  try {
    const now = moment.utc();
    const cachePath = path.join(
      cacheDir,
      `${now.date()}-${now.month()}-${now.year()}.json`
    );

    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, "utf8");
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cacheData), source: "cache" });
    }

    const item = await Item.find({});

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Item not found, please fetch data again",
      });
    }

    fs.writeFileSync(cachePath, JSON.stringify(item), "utf8");

    return res
      .status(200)
      .json({ success: true, data: item, source: "database" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Can't get item right now, Please contract admin ${err.message}`,
    });
  }
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
