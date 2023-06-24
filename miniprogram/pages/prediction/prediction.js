// prediction.js
Page({
    data: {
      wechat_id: '',
      name: '',
      role: '',
      currentDate: '',
      currentTime: '',
      forecastValue: '',
      timer: null,
      deadline:'',
    },
  
    onLoad: function() {
      this.getUserInfo();
      this.getCurrentDate();
  
      // 启动定时器
      this.data.timer = setInterval(() => {
        this.getCurrentTime();
      }, 1000);
      const that = this;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    wx.login({
      success: res => {
        // 发送 res.code 到后端换取 openId
        console.log('code成功', res.code);
        wx.request({
          url: 'https://wendaoxiansheng.com/api/get_openid',
          method: 'POST',
          data: {
            code: res.code
          },
          success: res => {
            console.log('get_openid成功', res.data.openid);
            let openid = res.data.openid;
            if (res.statusCode == 200) {
              this.setData({
                openid: openid
              });
              // 使用 openid 检查用户是否已注册
              wx.request({
                url: 'https://wendaoxiansheng.com/api/check_user',
                method: 'POST',
                data: {
                  openid: openid
                },
                success: res => {
                  if (res.statusCode == 200) {
                    console.log('check_user成功', res, formattedDate);
                    that.setData({
                      name: res.data.name,
                      date: formattedDate,
                    });
                  } else {
                    // HTTP 状态码不是 200，显示错误消息
                    wx.showModal({
                      title: '错误',
                      content: `check_user错误，返回的状态码是 ${res.statusCode}，请稍后再试。`,
                      showCancel: false
                    });
                  }
                }
              });
            } else {
              // HTTP 状态码不是 200，显示错误消息
              wx.showModal({
                title: '错误',
                content: `get_openid错误，返回的状态码是 ${res.statusCode}，请稍后再试。`,
                showCancel: false
              });

            }
          }
        });
      }
    });
    },
  
    onUnload: function() {
      // 页面卸载时清除定时器
      if (this.data.timer) {
        clearInterval(this.data.timer);
        this.data.timer = null;
      }
    },
  
    getUserInfo: function() {
      var that = this;
      wx.login({
        success(res) {
          if (res.code) {
            // 发起网络请求
            wx.request({
              url: 'http://localhost:5000/login',
              method: 'POST',
              data: {
                code: res.code
              },
              success(res) {
                that.setData({
                  wechat_id: res.data.wechat_id,
                  name: res.data.name,
                  role: res.data.role
                });
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      });
    },
  
    getCurrentDate: function() {
      var date = new Date();
      var currentDate = date.getFullYear() + '-' + this.pad(date.getMonth() + 1) + '-' + this.pad(date.getDate());
      this.setData({
        currentDate: currentDate
      });
    },
  
    getCurrentTime: function() {
      var date = new Date();
      var currentTime = this.pad(date.getHours()) + ':' + this.pad(date.getMinutes()) + ':' + this.pad(date.getSeconds());
      this.setData({
        currentTime: currentTime
      });
    },
  
    // 这是一个辅助函数，用于确保小时、分钟和秒始终是两位数
    pad: function(num) {
      return num < 10 ? '0' + num : num;
    },
  
    forecastInputChange: function(e) {
      this.setData({
        forecastValue: e.detail.value
      });
    },
  
    submitForecast: function() {
      var that = this;
      if (this.data.forecastValue) {
        wx.request({
          url: 'https://wendaoxiansheng.com/api/add_prediction_deposit',
          method: 'POST',
          data: {
            wechat_id: that.data.wechat_id,
            name: that.data.name,
            date: that.data.currentDate,
            forecast_public_deposit_year_increase: that.data.forecastValue
          },
          success(res) {
            if (res.data.status === 'ok') {
              wx.showToast({
                title: '预测数据上传成功',
                icon: 'success',
                duration: 2000
              });
            } else {
              wx.showToast({
                title: '预测数据上传失败',
                icon: 'none',
                duration: 2000
              });
            }
          }
        });
      } else {
        wx.showToast({
          title: '请填写预测数据',
          icon: 'none',
          duration: 2000
        });
      }
    }
  });
  