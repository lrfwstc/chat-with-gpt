Page({
  data: {
    openid: '',
    errorMsg: ''
  },

  onLoad: function() {
    wx.login({
      success: res => {
        const code = res.code;
        // 调用您的后端服务器接口，通过 code 获取 openid
        console.log('获取到的 code:', code);  // 添加这一行，将 code 输出到控制台
        wx.request({
          url: 'https://wendaoxiansheng.com/api/get_openid',
          method: 'POST',
          data: { code: code },
          success: res => {
            if (res.statusCode === 200) {
              this.setData({ openid: res.data.openid });
            } else {
              console.error('获取 OpenID 失败，服务器返回状态码：', res.statusCode);
              this.setData({ errorMsg: '获取 OpenID 失败，服务器返回状态码：' + res.statusCode });
            }
          },
          fail: error => {
            console.error('获取 OpenID 失败：', error);
            this.setData({ errorMsg: '获取 OpenID 失败：' + JSON.stringify(error) });
          }
        });
        
      }
    });
  },

  fetchLogFile: function() {
    wx.downloadFile({
      url: 'https://wendaoxiansheng.com/api/get_log_file', 
      success: function(res) {
        if (res.statusCode == 200) {
          // 文件已成功下载，可以在此处添加代码处理文件...
          console.log('下载文件成功', res)
          wx.openDocument({
            filePath: res.tempFilePath,
            success: function (res) {
              console.log('打开文档成功')
            },
            fail: function(res) {
              // 请求失败，可以在此处添加代码处理错误...
              console.log('打开文件失败', res)
            }
          })
        }
      },
      fail: function(res) {
        // 请求失败，可以在此处添加代码处理错误...
        console.log('下载文件失败', res)
      }
    })
  }

});
