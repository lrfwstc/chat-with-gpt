Page({
  data: {
    inputMessage: "",
    messages: [
      { sender: "ChatGPT", content: "你好！有什么问题我可以帮助你解答吗？" },
    ],
  },

  onInput: function (e) {
    this.setData({ inputMessage: e.detail.value });
  },

  onSendMessage: function () {
    const { inputMessage } = this.data;

    if (!inputMessage) return;

    this.setData({
      messages: this.data.messages.concat([{ sender: "User", content: inputMessage }]),
      inputMessage: "",
    });

    wx.cloud.callFunction({
      name: "chatwithgpt",
      data: { inputMessage },
      success: (res) => {
        this.setData({
          messages: this.data.messages.concat([{ sender: "ChatGPT", content: res.result }]),
        });
      },
      fail: (err) => {
        console.error("调用云函数失败", err);
      },
    });
  },
});
