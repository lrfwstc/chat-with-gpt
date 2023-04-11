// GPT.js
const app = getApp();

Page({
  data: {
    inputMessage: '',
    messages: [],
  },

  onInputMessage: function (e) {
    this.setData({ inputMessage: e.detail.value });
  },

  onSendMessage: function () {
    this.sendMessage(this.data.inputMessage);
    this.setData({ inputMessage: '' });
  },

  sendMessage: function (message) {
    if (!message) return;

    const msg = { content: message, fromUser: true };
    this.setData({ messages: [...this.data.messages, msg] });

    this.callBackend(message)
      .then((response) => {
        const reply = { content: response, fromUser: false };
        this.setData({ messages: [...this.data.messages, reply] });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  },

  callBackend: function (message) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://183.206.166.189:3000/api/chat', // 替换为您的实际主机地址和端口
        method: 'POST',
        header: {
          'content-type': 'application/json',
        },
        data: {
          message: message,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.response);
          } else {
            reject(new Error('Failed to get response from server'));
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },
});
