const tiktok = require("../utils/tikwm");

exports.download = async (req, res) => {
  const { url } = req.query;
  if (!url)
    return res.status(400).jsonp({
      status: 400,
      message: "invalid url",
    });
  const data = await tiktok.tikwm(url);
  res.status(200).jsonp(data);
};
