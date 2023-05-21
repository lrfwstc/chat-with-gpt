Page({
  data: {
    users: [],
    date: '',
    startDate: '',
    endDate: ''
  },
    onLoad: function() {
      //this.getUsers();
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
      this.setData({
        date: formattedDate
      }); 
    },
    bindStartDateChange: function(e) {
      console.log('开始日期发送选择改变，携带值为', e.detail.value)
      this.setData({
        startDate: e.detail.value
      })
    },
    bindEndDateChange: function(e) {
      console.log('结束日期发送选择改变，携带值为', e.detail.value)
      this.setData({
        endDate: e.detail.value
      })
    },
    getUsers: function() {
      let that = this;
      wx.request({
        url: 'https://wendaoxiansheng.com/api/get_users',
        method: 'GET',
        success: function(res) {
          console.log('getUsers成功',res.data);
          that.setData({users: res.data});
        }
      });
    },
    deleteUser: function(event) {
        const id = event.currentTarget.dataset.id;
        console.log('deleteUser中',id);
      wx.request({
        url: 'https://wendaoxiansheng.com/api/delete_user',
        method: 'POST',
        data: {id: id},
        success: this.getUsers  // 更新用户列表
      });
    },

    goToUsers: function() {
        wx.navigateTo({
          url: '/pages/users/users'
        });
      },
    
      
      downloadWorklog: function() {
        wx.downloadFile({
          url: `https://wendaoxiansheng.com/api/export_worklog?startDate=${this.data.startDate}&endDate=${this.data.endDate}`, 
          success: function(res) {
            var filePath = res.tempFilePath
            wx.openDocument({
              showMenu:true,
              filePath: filePath,
              fileType: 'xlsx',
              success: function(res) {
                console.log('打开文档成功')
              },
            })
          },
        })
      },  
       
  });
  