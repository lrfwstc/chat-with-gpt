// GPT.js
const app = getApp();

Page({
  data: {
    inputText: "",
    outputText: "",
  },

  onLoad: function () {},

  onInput: function (e) {
    this.setData({
      inputText: e.detail.value,
    });
  },

  onSend: function () {
    const { inputText } = this.data;

    if (inputText.trim() === "") {
      wx.showToast({
        title: "请输入内容",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    this.callGPT(inputText);
  },

  callGPT: function (prompt) {
    wx.showLoading({
      title: "处理中...",
    });

    wx.request({
      url: "183.206.166.189:3000/api/generate-text", // 替换为您的主机地址和端口
      method: "POST",
      data: {
        prompt: prompt,
        maxTokens: 50,
        temperature: 0.7,
      },
      success: (res) => {
        this.setData({
          outputText: res.data.response,
        });
      },
      fail: (err) => {
        console.error("调用失败", err);
      },
      complete: () => {
        wx.hideLoading();
      },
    });
  },
});
