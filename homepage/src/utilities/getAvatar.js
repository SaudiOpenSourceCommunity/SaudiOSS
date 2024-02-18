import https from "https";
import axios from "axios";
import fsPromisified from "fs/promises";
import path from "path";

const axiosInstance = axios.create({
  maxRedirects: 35,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
const targetDirectory = "public/assets/images/avatars";

async function downloadAvatar(username) {
  
  const avatarPath = path.join(targetDirectory, `${username}.png`);

  try {
    const avatarUrl = `https://github.com/${username}.png?size=200`;
    const response = await axiosInstance.get(avatarUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    await fsPromisified.writeFile(avatarPath, buffer);
    console.log("Avatar downloaded:", username, "path", avatarPath);
    return avatarPath;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("GitHub avatar not found. Using placeholder image.");
      await downloadPlaceholder(username);
      return avatarPath;
    } else {
      console.error("Error downloading avatar:", username, "path", avatarPath, "Error Code", error.code, error.message);
      return null;
    }
  }
}

async function downloadPlaceholder(username) {
  const avatarPath = path.join(targetDirectory, `${username}.png`);

  if (fs.existsSync(avatarPath)) {
    return avatarPath;
  }

  const PLACEHOLDER_IMAGE_URL = `https://icotar.com/initials/${username}`;
  try {
    const placeholderResponse = await axiosInstance.get(PLACEHOLDER_IMAGE_URL, { responseType: "arraybuffer" });
    const placeholderBuffer = Buffer.from(placeholderResponse.data);
    await fsPromisified.writeFile(avatarPath, placeholderBuffer);
  } catch (error) {
    console.error("Error downloading placeholder:", username, "path", avatarPath, "Error Code", error.code, error.message);
  }
}

export { downloadAvatar, downloadPlaceholder };
