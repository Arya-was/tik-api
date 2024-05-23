const axios = require("axios");
const cheerio = require("cheerio");
const BASE_URL = "https://ssstik.io";

function _request() {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.request({
        url: `${BASE_URL}`,
        methode: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
        },
      });
      const regex = /s_tt\s*=\s*["']([^"']+)["']/;
      const match = data.match(regex);
      if (match) {
        const value = match[1];
        resolve({ status: "success", request: value });
      } else {
        resolve({
          status: "error",
          message: "Failed to get the request form!",
        });
      }
    } catch (e) {
      reject(
        new Error({
          status: "error",
          message: e,
        })
      );
    }
  });
}

function ssstik(url) {
  return new Promise(async (resolve, reject) => {
    const request = await _request();
    const { data } = await axios.request({
      url: `${BASE_URL}/abc?url=dl`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
      },
      data: {
        id: url,
        locale: "en",
        tt: request.request,
      },
    });
    const $ = cheerio.load(data);
    const desc = $("p.maintext").text().trim();
    const author = {
      avatar: $("img.result_author").attr("src"),
      nickname: $("h2").text().trim(),
    };
    const statistics = {
      likeCount: $("#trending-actions > .justify-content-start").text().trim(),
      commentCount: $("#trending-actions > .justify-content-center")
        .text()
        .trim(),
      shareCount: $("#trending-actions > .justify-content-end").text().trim(),
    };

    //Result
    const images = [];
    $("ul.splide__list > li")
      .get()
      .map((img) => {
        images.push($(img).find("a").attr("href"));
      });
    if (images.length !== 0) {
      // Images
      resolve({
        status: "success",
        result: {
          type: "image",
          desc,
          author,
          statistics,
          images,
          music: $("a.music").attr("href"),
        },
      });
    } else {
      // Video Result
      resolve({
        status: "success",
        result: {
          type: "video",
          desc,
          author,
          statistics,
          video: $("a.without_watermark").attr("href"),
          music: $("a.music").attr("href"),
        },
      });
    }
  });
}

module.exports = { ssstik };
