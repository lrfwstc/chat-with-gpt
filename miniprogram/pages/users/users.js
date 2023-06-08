Page({
  data: {
    users: [],
    date: '',
    activeNames: ['1'], 
    managerUsers: [],
    adminUsers: [],
    minmanagerUsers: [],
    visitorUsers: [],
    preusers: [],
    manager_managerusers: [],
    branch_managerusers: [],
    roleNames: {
      'preManager': '对公客户经理',
      'preAdmin': '管理员',
      'preVisitor': '游客',
      'preminManager': '小微客户经理'
    }
  },
  onLoad: function() {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    this.setData({
      date: formattedDate,
  });
    this.getUsers();
  },
  onChange: function(event) {
    this.setData({ activeNames: event.detail });
  },
  getUsers: function() {
    let that = this;
    wx.request({
      url: 'https://wendaoxiansheng.com/api/get_users',
      method: 'GET',
      success: function(res) {
        console.log('getUsers successful', res.data);
        const managerUsers = res.data.filter(user => user.role === 'Manager'|| user.role === 'manager_manager' || user.role === 'branch_manager');
        const manager_managerusers = res.data.filter(user => user.role === 'manager_manager');
        const branch_managerusers = res.data.filter(user => user.role === 'branch_manager');
        const adminUsers = res.data.filter(user => user.role === 'Admin');
        const minmanagerUsers = res.data.filter(user => user.role === 'minManager');
        const visitorUsers = res.data.filter(user => user.role === 'Visitor');
        const preusers = res.data.filter(user => user.role === 'preManager' || user.role === 'preminManager' || user.role === 'preAdmin' || user.role === 'preVisitor');
        that.setData({ managerUsers, adminUsers,minmanagerUsers,visitorUsers,preusers,manager_managerusers,branch_managerusers });
        that.checkWorklogExistenceBulk(managerUsers);
      }
    });
  },
  
  checkWorklogExistenceBulk: function(users) {
    let that = this;
    const names = users.map(user => user.name);
    wx.request({
      url: 'https://wendaoxiansheng.com/api/worklog_check_bulk',
      method: 'POST',
      data: { names: names, date: that.data.date },
      success: function(res) {
        console.log('checkWorklogExistenceBulk successful', res.data);
        users.forEach(user => {
          user.exist = res.data[user.name];
        });
        that.setData({ managerUsers: users });
      }
    });
  },

  deleteUser: function(event) {
    const id = event.currentTarget.dataset.id;
    console.log('deleteUser中', id);
    wx.request({
      url: 'https://wendaoxiansheng.com/api/delete_user',
      method: 'POST',
      data: { id: id },
      success: this.getUsers // 更新用户列表
    });
  },

  exchangeUser: function(event) {
    const id = event.currentTarget.dataset.id;
    console.log('exchangeUser中', id);
    wx.request({
      url: 'https://wendaoxiansheng.com/api/exchange_user',
      method: 'POST',
      data: { id: id },
      success: this.getUsers // 更新用户列表
    });
  }
});
