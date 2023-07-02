// prediction.js
Page({
  data: {
    wechat_id: '',
    name: '',
    currentDate: '',
    currentMonth: '',
    currentTime: '',
    forecastValue: '',
    timer: null,
    deadline: '',
    predictionData: '',
    reason_predictionData: '',
  },

  onLoad: function() {
    this.getUserInfo();
    this.getCurrentDate();

    this.data.timer = setInterval(() => {
      this.getCurrentTime();
    }, 1000);

    const that = this;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    wx.login({
      success: res => {
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
                wechat_id: openid
              });
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
                    wx.showModal({
                      title: '错误',
                      content: `check_user错误，返回的状态码是 ${res.statusCode}，请稍后再试。`,
                      showCancel: false
                    });
                  }
                }
              });
            } else {
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
    var currentMonth = date.getFullYear() + '-' + this.pad(date.getMonth() + 1) ;
    this.setData({
      currentDate: currentDate,
      currentMonth:currentMonth
    });
  },

  getCurrentTime: function() {
    var date = new Date();
    var currentTime = this.pad(date.getHours()) + ':' + this.pad(date.getMinutes()) + ':' + this.pad(date.getSeconds());
    this.setData({
      currentTime: currentTime
    });
  },

  pad: function(num) {
    return num < 10 ? '0' + num : num;
  },

  forecastInputChange: function(e) {
    this.setData({
      forecastValue: e.detail.value
    });
  },

  handleInput: function(e) {
    const { field } = e.currentTarget.dataset;
    let value = e.detail.value;
  
    // 只保留数字、负号和小数点，其他字符替换为空字符串
    value = value.replace(/[^\d.-]/g, '');
  
    this.setData({
      [field]: value,
    });
  }, 

  handleInput_n: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value,
    });
  },

  handleSubmit: function() {
    var that = this;
    console.log('开始submit', that.data);
    if (this.data.predictionData && this.data.reason_predictionData) {
      wx.request({
        url: 'https://wendaoxiansheng.com/api/add_prediction',
        method: 'POST',
        data: {
          wechat_id: that.data.wechat_id,
          name: that.data.name,
          date: that.data.currentMonth,
          predictionData: that.data.predictionData,
          reason_predictionData: that.data.reason_predictionData
        },
        success(res) {
          if (res.statusCode == 200) {
            if (res.data.message == 'New prediction has overwritten old prediction') {
              console.log('New prediction has overwritten old prediction');
              wx.showToast({
                title: '提交成功，已覆盖当月旧数据',
                icon: 'success',
                duration: 2000
              })
            } else {
              console.log('New prediction has been added');
              wx.showToast({
                title: '提交成功',
                icon: 'success',
                duration: 2000
              })
            }
            
          } else {
            console.log('提交失败', this.data);
            wx.showToast({
              title: '提交失败，请联系开发者',
              icon: 'none',
              duration: 2000
            })
          }
        }
      });
    } else {
      wx.showToast({
        title: '请填写预测数据及其原因',
        icon: 'none',
        duration: 2000
      });
    }
  }
});
