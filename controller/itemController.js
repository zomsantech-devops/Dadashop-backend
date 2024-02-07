const Item = require("../models/Item");
const axios = require("axios");
const { kv } = require("@vercel/kv");

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

  const cacheKey = `itemr_${itemId}`;
  console.log(cacheKey);
  try {
    const cacheData = await kv.get(cacheKey);
    console.log("Get successful");
    if (!cacheData) {
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

      const displayAssetsString = arrayJsonToRedis(
        response.data.item.displayAssets
      );

      delete response.data.item.displayAssets;

      const dataString = jsonToRedis(response.data);

      // console.log(dataString, displayAssetsString)
      // console.log(arrayRedisToJson(displayAssetsString), redisToJson(dataString))

      try {
        console.log("Set successful");
        await kv.set(`${cacheKey}_main`, dataString, { ex: 3600 });
        await kv.set(`${cacheKey}_displayAssets`, displayAssetsString, {
          ex: 3600,
        });
      } catch (err) {
        console.log("Caching Error", err);
      }

      // const fullData = {
      //   ...response.data,
      //   item: {
      //     ...response.data.item,
      //     displayAssets: arrayRedisToJson(displayAssetsString),
      //   },
      // };

      const fullData = {
        ...response.data,
        item: {
          ...response.data.item,
          displayAssets: arrayRedisToJson(displayAssetsString),
          styles: response.data.item.styles.map((style, index) => {
            const videoUrl = response.data.item.previewVideos[index]
              ? response.data.item.previewVideos[index].url
              : null;

            return {
              ...style,
              video_url: videoUrl,
            };
          }),
        },
      };

      return res.status(200).json({
        success: true,
        data: fullData,
        source: "database",
      });
    }

    const mainDataString = await kv.get(`${cacheKey}_main`);
    const displayAssetsString = await kv.get(`${cacheKey}_displayAssets`);
    const mainData = redisToJson(mainDataString);
    const displayAssetsData = arrayRedisToJson(displayAssetsString);

    const fullData = {
      ...mainData,
      item: { ...mainData.item, displayAssets: displayAssetsData },
    };

    return res
      .status(200)
      .json({ success: true, data: fullData, source: "cache" });
  } catch (err) {
    console.log("Caching Error", err);
    return res.status(500);
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
      // ตรวจสอบและกำหนดค่าเริ่มต้นสำหรับ displayAssets
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

      // ตรวจสอบค่า null ก่อน map displayAssets
      const display_assets = shopItem.displayAssets
        ? shopItem.displayAssets.map((asset) => ({
            display_id: asset.displayAsset ? asset.displayAsset : null,
            image_url: asset.url ? asset.url : null,
            image_background: asset.background ? asset.background : null,
            image_full_background: asset.full_background
              ? asset.full_background
              : null,
          }))
        : [];

      // สร้าง object สำหรับ push โดยตรวจสอบค่า null ทุกครั้ง
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
        time_fetch: time_fetch,
        time_update: time_update,
        uid_update: uid_update ? uid_update : null,
      });
    });

    for (let item of extractedItems) {
      await Item.create(item);
    }

    try {
      const time = new Date();

      cacheKey = `dater_${time.getDate()}-${time.getMonth()}`;
      await kv.del(cacheKey);

      const item = await Item.find({});
      await kv.set(cacheKey, arrayJsonToRedis(item), {
        ex: 1800,
        nx: true,
      });

      console.log("Get Cache Reset Successfully");
      console.log("Set Cache Successful");
      return { new: Date() };
    } catch (err) {
      console.log("Caching Error", err);
      // res.status(500);
    }

    return { time_update };
  } catch (err) {
    console.log("ERROR : ", err);
    // return res.status(500);
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
  const time = new Date();
  cacheKey = `dater_${time.getDate()}-${time.getMonth()}`;
  try {
    const cacheData = await kv.get(cacheKey);
    // console.log(cacheData);

    console.log("Get successful");
    // if (true) {
    if (!cacheData) {
      const item = await Item.find({});

      if (!item) {
        return res.status(400).json({
          success: false,
          message: "Item not found, please fetch data again",
        });
      }

      try {
        await kv.set(cacheKey, arrayJsonToRedis(item), {
          ex: 1800,
          nx: true,
        });
        console.log("Set Cache Successful");
      } catch (err) {
        console.log("Caching Error", err);
        return res.status(500);
      }

      return res
        .status(200)
        .json({ success: true, data: item, source: "database" });
    }

    return res.status(200).json({
      success: true,
      data: arrayRedisToJson(cacheData),
      source: "cache",
    });
  } catch (err) {
    console.log("Caching Error", err);
    return res.status(500);
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
