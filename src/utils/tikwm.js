const axios = require("axios");
const BASE_URL = "https://www.tikwm.com";

function tikwm(url) {
  return new Promise(async (resolve, reject) => {
    const { data } = await axios.request({
      url: `${BASE_URL}/api/`,
      method: "POST",
      data: new URLSearchParams(Object.entries({ url })),
    });
    resolve({
      status: "success",
      result: data,
    });
  });
}

module.exports = { tikwm };
