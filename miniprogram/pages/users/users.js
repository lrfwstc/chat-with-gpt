Page({
    data: {
      users: []
    },
    onLoad: function() {
      this.getUsers();
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
    }
  });
  