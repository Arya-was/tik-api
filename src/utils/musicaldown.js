const axios = require("axios");
const cheerio = require("cheerio");
const BASE_URL = "https://musicaldown.com";

function _request(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await axios.get(BASE_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
        },
      });
      const cookie =
        data.headers["set-cookie"][0].split(";")[0] + "; " + "lang=en";
      const $ = cheerio.load(data.data);
      const input = $("div > input").map((_, el) => $(el));
      const request = {
        [input.get(0).attr("name")]: url,
        [input.get(1).attr("name")]: input.get(1).attr("value"),
        [input.get(2).attr("name")]: input.get(2).attr("value"),
      };
      resolve({ status: "success", request, cookie });
    } catch (e) {
      reject(
        new Error({
          status: "error",
          message: "Failed to get the request form!",
        })
      );
    }
  });
}

function _music(cookie) {
  return new Promise(async (resolve, reject) => {
    const { data } = await axios.request({
      url: `${BASE_URL}/mp3/download`,
      method: "GET",
      headers: {
        cookie: cookie,
        "Upgrade-Insecure-Requests": "1",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
      },
    });
    const $ = cheerio.load(data);
    const music = $("audio > source").attr("src");
    resolve({ status: "success", result: music });
  });
}

function musicaldown(url) {
  return new Promise(async (resolve, reject) => {
    const request = await _request(url);
    if (request.status !== "success")
      return resolve({ status: "error", message: request.message });
    const { data } = await axios.request({
      url: `${BASE_URL}/download`,
      method: "POST",
      headers: {
        cookie: request.cookie,
        "Upgrade-Insecure-Requests": "1",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0",
      },
      data: request.request,
    });
    const $ = cheerio.load(data);

    //Images
    const images = [];
    $("div.row > div[class='col s12 m3']")
      .get()
      .map((v) => {
        images.push($(v).find("img").attr("src"));
      });

    //Video
    let i = 1;
    let videos = {};
    $("div[class='col s12 l8'] > a")
      .get()
      .map((v) => {
        if ($(v).attr("href") !== "#modal2") {
          let text = $(v)
            .text()
            .trim()
            .replace(/\s/, " ")
            .replace("arrow_downward", "")
            .toLowerCase();
          videos[
            text.includes("hd")
              ? "video_hd"
              : text.includes("watermark")
              ? "video_watermark"
              : `video${i}`
          ] = $(v).attr("href");
          i++;
        }
      });
    //Result
    if (images.length !== 0) {
      resolve({
        status: "success",
        result: {
          type: "image",
          author: {
            nickname: $("h2.white-text")
              .text()
              .trim()
              .replace("Download Now: Check out ", "")
              .replace(
                "’s video! #TikTok >If MusicallyDown has helped you, you can help us too",
                ""
              )
              .replace("Download Now: ", "")
              .replace(
                "If MusicallyDown has helped you, you can help us too",
                ""
              ),
          },
          images,
          music: $("a.download").attr("href"),
        },
      });
    } else {
      // Video Result
      const music = await _music(request.cookie);
      resolve({
        status: "success",
        result: {
          type: "video",
          author: {
            avatar: $("div.img-area > img").attr("src"),
            nickname: $("div.row > div > div > h2")
              .map((_, el) => $(el).text())
              .get(0),
          },
          desc: $("div.row > div > div > h2")
            .map((_, el) => $(el).text())
            .get(1),
          music: music.result,
          ...videos,
        },
      });
    }
  });
}

module.exports = { musicaldown };
