const axios = require('axios');
require('dotenv').config();  // 确保你有一个 .env 文件来存储 API Key

const apiKey = process.env.MAPTILER_API_KEY; // 从 .env 文件中获取 API Key

async function getGeocode(location) {
    const encodedLocation = encodeURIComponent(location);
    const url = `https://api.maptiler.com/geocoding/${encodedLocation}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);

        // 检查是否有返回的 features，并确保我们能获取到第一个结果
        const features = response.data.features;
        if (features && features.length > 0) {
            const firstFeature = features[0]; // 获取第一个 feature
            const coordinates = firstFeature.geometry.coordinates; // 提取经纬度
            const longitude = coordinates[0]; // 经度
            const latitude = coordinates[1]; // 纬度

            console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);  // 打印经纬度
            return { longitude, latitude };
        } else {
            throw new Error('No results found for this location.');
        }
    } catch (error) {
        throw new Error('Error retrieving geocode data: ' + error.message);
    }
}

module.exports = getGeocode;