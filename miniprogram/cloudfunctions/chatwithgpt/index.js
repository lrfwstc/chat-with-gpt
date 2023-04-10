const cloud = require("wx-server-sdk");
const axios = require("axios");
const SocksProxyAgent = require("socks-proxy-agent");

cloud.init();

const wxContext = cloud.getWXContext();
const API_KEY = wxContext.API_KEY; // 获取环境变量中的API密钥
const CHATGPT_API_URL = "https://api.openai.com/v1/engines/davinci-codex/completions";

const shadowsocksConfig = {
    host: wxContext.SHADOWSOCKS_HOST,
    port: wxContext.SHADOWSOCKS_PORT,
    method: wxContext.SHADOWSOCKS_METHOD,
    password: wxContext.SHADOWSOCKS_PASSWORD,
  };

const agent = new SocksProxyAgent({
  protocol: "socks5",
  hostname: shadowsocksConfig.host,
  port: shadowsocksConfig.port,
  username: shadowsocksConfig.method,
  password: shadowsocksConfig.password,
});

async function getChatGPTResponse(inputMessage) {
  try {
    const response = await axios.post(
      CHATGPT_API_URL,
      {
        prompt: inputMessage,
        max_tokens: 50,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        httpsAgent: agent,
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error in ChatGPT API request:", error);
    return "抱歉，无法获取回复。";
  }
}

async function storeChatMessage(sender, content) {
  const db = cloud.database();
  const chatMessagesCollection = db.collection("chat-messages");

  try {
    await chatMessagesCollection.add({
      data: {
        sender,
        content,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error storing chat message:", error);
  }
}

exports.main = async (event, context) => {
  const { inputMessage } = event;
  await storeChatMessage("User", inputMessage);

  const chatGPTResponse = await getChatGPTResponse(inputMessage);
  await storeChatMessage("ChatGPT", chatGPTResponse);

  return chatGPTResponse;
};
