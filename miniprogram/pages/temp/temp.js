Page({
  data: {
    openid: ''
  },

  onLoad: function() {
    wx.login({
      success: res => {
        const code = res.code;
        // 调用您的后端服务器接口，通过 code 获取 openid
        wx.request({
          url: 'https://wendaoxiansheng.com/api/get_openid',
          method: 'POST',
          data: { code: code },
          success: res => {
            this.setData({ openid: res.data.openid });
          },
          fail: error => {
            console.error('获取 OpenID 失败：', error);
          }
        });
      }
    });
  }
});