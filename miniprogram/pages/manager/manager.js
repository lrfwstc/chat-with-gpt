Page({
  data: {
    openid: '',
    date: '',
    wechat_id: '',
    manager_name: '',
    public_deposit_balance: '',
    public_deposit_day_increase: '',
    public_deposit_year_increase: '',
    public_deposit_change_detail: '无',
    public_effective_account_balance: '',
    public_effective_account_day_increase: '',
    public_effective_account_base_increase: '',
    public_effective_account_change_detail: '无',
    deposit_value_customer_balance: '',
    deposit_value_customer_day_increase: '',
    deposit_value_customer_base_increase: '',
    deposit_value_customer_change_detail: '无',
    digital_currency_active_account_balance: '',
    digital_currency_active_account_day_increase: '',
    digital_currency_active_account_base_increase: '',
    digital_currency_active_account_change_detail: '无',
    public_deposit_forecast: '',
    public_deposit_forecast_year_increase: '',
    public_effective_account_forecast: '',
    public_effective_account_forecast_base_increase: '',
    deposit_value_customer_forecast: '',
    deposit_value_customer_forecast_base_increase: '',
    new_customer_visit_name: '无',
    new_customer_visit_position: '无',
    planning_customer_visit_name: '无',
    planning_customer_visit_position: '无',
    planning_customer_visit_matters: '无',
    other_customer_visit_name: '无',
    other_customer_visit_position: '无',
    other_customer_visit_matters: '无',
    other_work: '无',
  },

  // 处理输入事件
  handleInput: function(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value,
    });
  },

  // 提交数据
  submitData: function() {
    // 这里的代码需要调用 API 向服务器发送数据
    wx.request({
      url: 'https://wendaoxiansheng.com/api/add_worklog', // 你的 API 路径
      method: 'POST',
      data: this.data,
      success(res) {
        if (res.statusCode == 200) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '提交失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  onLoad: function(options) {
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
                      manager_name: res.data.name,
                      date: formattedDate,
                    });

                    // 获取客户经理的最近一次上传数据
                    wx.request({
                      url: 'https://wendaoxiansheng.com/api/get_recent_worklog',
                      method: 'POST',
                      data: {
                        openid: openid
                      },
                      success: res => {
                        if (res.statusCode == 200) {
                          const recentWorklog = res.data;
                          console.log('get_recent_worklog成功', recentWorklog);
                          if(Object.keys(res.data).length === 0){
                            wx.showModal({
                              title: '提示',
                              content: '未获取到最近一次的记录，下次填报将自动获取',
                              showCancel: false
                            });
                            return;
                          }
                          else{
                          that.setData({
                            public_deposit_balance: recentWorklog.public_deposit_balance ,
                            public_deposit_day_increase: recentWorklog.public_deposit_day_increase ,
                            public_deposit_year_increase: recentWorklog.public_deposit_year_increase ,
                            public_deposit_change_detail: recentWorklog.public_deposit_change_detail ,
                            public_effective_account_balance: recentWorklog.public_effective_account_balance ,
                            public_effective_account_day_increase: recentWorklog.public_effective_account_day_increase,
                            public_effective_account_base_increase: recentWorklog.public_effective_account_base_increase ,
                            public_effective_account_change_detail: recentWorklog.public_effective_account_change_detail ,
                            deposit_value_customer_balance: recentWorklog.deposit_value_customer_balance,
                            deposit_value_customer_day_increase: recentWorklog.deposit_value_customer_day_increase ,
                            deposit_value_customer_base_increase: recentWorklog.deposit_value_customer_base_increase ,
                            deposit_value_customer_change_detail: recentWorklog.deposit_value_customer_change_detail ,
                            digital_currency_active_account_balance: recentWorklog.digital_currency_active_account_balance ,
                            digital_currency_active_account_day_increase: recentWorklog.digital_currency_active_account_day_increase ,
                            digital_currency_active_account_base_increase: recentWorklog.digital_currency_active_account_base_increase ,
                            digital_currency_active_account_change_detail: recentWorklog.digital_currency_active_account_change_detail ,
                            public_deposit_forecast: recentWorklog.public_deposit_forecast ,
                            public_deposit_forecast_year_increase: recentWorklog.public_deposit_forecast_year_increase,
                            public_effective_account_forecast: recentWorklog.public_effective_account_forecast ,
                            public_effective_account_forecast_base_increase: recentWorklog.public_effective_account_forecast_base_increase ,
                            deposit_value_customer_forecast: recentWorklog.deposit_value_customer_forecast,
                            deposit_value_customer_forecast_base_increase: recentWorklog.deposit_value_customer_forecast_base_increase ,
                            new_customer_visit_name: recentWorklog.new_customer_visit_name ,
                            new_customer_visit_position: recentWorklog.new_customer_visit_position ,
                            planning_customer_visit_name: recentWorklog.planning_customer_visit_name,
                            planning_customer_visit_position: recentWorklog.planning_customer_visit_position ,
                            planning_customer_visit_matters: recentWorklog.planning_customer_visit_matters ,
                            other_customer_visit_name: recentWorklog.other_customer_visit_name,
                            other_customer_visit_position: recentWorklog.other_customer_visit_position ,
                            other_customer_visit_matters: recentWorklog.other_customer_visit_matters ,
                            other_work: recentWorklog.other_work,
                          });}
                        } else {
                          // 处理错误情况
                        }
                        
                      }
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
})
