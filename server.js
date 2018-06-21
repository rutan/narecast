const request = require("request");
const express = require("express");
const app = express();

app.use(express.static("dist"));

function renderErrorJSON(res, status, reason) {
  res.status(status).send(
    JSON.stringify({
      error: {
        reason
      }
    })
  );
}

app.get("/api/converted_list", (req, res) => {
  res.header("Content-Type", "application/json");

  const id = `${req.query.id || ""}`;
  if (!id.match(/^kn[1-9]\d*$/)) {
    renderErrorJSON(res, 400, "invalid_id");
    return;
  }

  request(
    {
      method: "GET",
      url: `https://niconare.nicovideo.jp/api/v1/works/${id.replace("kn", "")}`,
      headers: {
        "User-Agent": "narecast by @ru_shalm"
      }
    },
    (error, response) => {
      if (error) {
        renderErrorJSON(res, 400, "invalid_content");
        return;
      }
      const json = JSON.parse(response.body);
      if (!json.meta || json.meta.status !== 200) {
        renderErrorJSON(res, 400, "invalid_content");
        return;
      }
      const thumbnails = json.data.thumbnails;

      if (
        !thumbnails[0].image_urls ||
        !thumbnails[1].image_urls.original ||
        !thumbnails[2].image_urls.original.match(/\/[1-9]\d*\.jpg$/)
      ) {
        renderErrorJSON(res, 400, "unsupported_item");
        return;
      }

      res.send(
        JSON.stringify({
          urls: thumbnails.map(t => t.image_urls.original)
        })
      );
    }
  );
});

app.listen(process.env.PORT || 3000, () => {
  console.log("start!");
});
