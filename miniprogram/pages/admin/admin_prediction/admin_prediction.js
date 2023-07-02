// pages/admin/admin_prediction/admin_prediction.js
Page({
    data: {
      users: [],
      activeNames: ['1'], 
      currentDate: '',
      currentMonth: '',
      managerUsers: [],  
    },
    onLoad: function() {
      this.getCurrentDate();
      this.getUsers();
    },
    onChange: function(event) {
      this.setData({ activeNames: event.detail });
    },
    
    pad: function(num) {
        return num < 10 ? '0' + num : num;
      },

    getCurrentDate: function() {
        var date = new Date();
        var currentDate = date.getFullYear() + '-' + this.pad(date.getMonth() + 1) + '-' + "1";
        var currentMonth = date.getFullYear() + '-' + this.pad(date.getMonth() + 1) ;
        this.setData({
          currentDate: currentDate,
          currentMonth:currentMonth
        });
      },



      
    getUsers: function() {
        let that = this;
        wx.request({
          url: 'https://wendaoxiansheng.com/api/get_users',
          method: 'GET',
          success: function(res) {
            console.log('getUsers successful', res.data);
            const managerUsers = res.data.filter(user => user.role === 'Manager'|| user.role === 'manager_manager' );
            const manager_managerusers = res.data.filter(user => user.role === 'manager_manager');
            const branch_managerusers = res.data.filter(user => user.role === 'branch_manager');
            const adminUsers = res.data.filter(user => user.role === 'Admin');
            const minmanagerUsers = res.data.filter(user => user.role === 'minManager');
            const visitorUsers = res.data.filter(user => user.role === 'Visitor');
            const preusers = res.data.filter(user => user.role === 'preManager' || user.role === 'preminManager' || user.role === 'preAdmin' || user.role === 'preVisitor');
            that.setData({ managerUsers, adminUsers,minmanagerUsers,visitorUsers,preusers,manager_managerusers,branch_managerusers });
            that.checkPredictionExistenceBulk(managerUsers);
          }
        });
      },

      checkPredictionExistenceBulk: function(users) {
        let that = this;
        const names = users.map(user => user.name);
        wx.request({
          url: 'https://wendaoxiansheng.com/api/prediction_check_bulk',
          method: 'POST',
          data: { names: names, date: that.data.currentMonth },
          success: function(res) {
            console.log('checkWorklogExistenceBulk successful', res.data);
            users.forEach(user => {
              if (res.data[user.name]) {
                user.forecast_public_deposit_year_increase = res.data[user.name].forecast_public_deposit_year_increase;
                user.reason_forecast_public_deposit_year_increase = res.data[user.name].reason_forecast_public_deposit_year_increase;
                user.locked = res.data[user.name].locked;
                // 更新其他你需要的属性
              } else {
                user.forecast_public_deposit_year_increase = '无';
                user.reason_forecast_public_deposit_year_increase = '无';
                user.locked = '无';
                // 设置其他你需要的属性为'无'
              }
            });
            that.setData({ managerUsers: users });
          }
        });
    },
    

    getPredictions: function() {
      let that = this;
      wx.request({
        url: 'https://wendaoxiansheng.com/api/get_predictions',
        method: 'GET',
        success: function(res) {
          console.log('getPredictions successful', res.data);
          const predictions = res.data;
          const users = that.data.users.map(user => {
            const prediction = predictions.find(p => p.userId === user.id);
            if (prediction) {
              user.forecast = prediction.forecast_public_deposit_year_increase;
            }
            return user;
          });
          that.setData({ users });
        }
      });
    },

    lockUser: function(event) {
        const wechat_id = event.currentTarget.dataset.wechat_id;
        const date = this.data.currentDate;
        console.log('lockUser中', wechat_id);
        wx.request({
          url: 'https://wendaoxiansheng.com/api/lock_user',
          method: 'POST',
          data: { wechat_id: wechat_id, date: date },
          success: this.getUsers // 更新用户列表
        });
      },
      
      unlockUser: function(event) {
        const wechat_id = event.currentTarget.dataset.wechat_id;
        const date = this.data.currentDate;
        console.log('unlockUser中', wechat_id,date);
        wx.request({
          url: 'https://wendaoxiansheng.com/api/unlock_user',
          method: 'POST',
          data: { wechat_id: wechat_id, date: date },
          success: this.getUsers // 更新用户列表
        });
      }
      
  });
  