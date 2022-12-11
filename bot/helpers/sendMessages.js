import config from "../../src/config/index.js";
import axios from "axios";

export default async (users = [], text) => {
  try {
    await Promise.all(
      users.map((id) =>
        axios.get(
          `https://api.telegram.org/bot${config.botToken}/sendMessage?chat_id=${id}&text=${encodeURIComponent(
            text
          )}&disable_web_page_preview=true&parse_mode=HTML`
        )
      )
    );
  } catch (error) {
    console.log(error.message || error);
  }
};
