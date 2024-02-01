export const fetchItem = async (req, res) => {
  try {
    const response = await axios.get("https://fortniteapi.io/v2/shop", {
      headers: {
        accept: "application/json",
        Authorization: "40cb2d55-3b4133d9-f1708ca0-0f179353",
      },
      params: {
        lang: "en",
        includeRenderData: true,
        date: "2024-01-31",
        includeHiddenTabs: false,
      },
    });
    if (!response || !response.data || !response.data.shop) {
      throw new Error("No data returned from the API");
    }

    const data = response.data;

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
        });
      });
    });

    extractedItems.forEach((item) => {
      const matchingElement = data.shop.find(
        (shopItem) =>
          shopItem.displayName === item.name &&
          shopItem.displayType === item.type_name
      );

      if (matchingElement) {
        item.finalPrice = matchingElement.price.finalPrice;
      }
    });
    res.json(extractedItems);
  } catch (err) {
    res.status(500).send("Error fetching data" + err);
  }
};
