Page({
	data: {
	  openid: '',
	  showRegisterForm: false,
	  roleIndex: -1,  // 添加一个新的属性来保存角色的索引
      roles: ['对公客户经理', '小微客户经理', '管理员','游客','管理经理','二级支行行长'],  // 添加一个数组来保存所有的角色
	  backroles: ['preManager', 'preminManager', 'preAdmin','preVisitor','premanager_manager','prebranch_manager'] ,
	  role: ''
  
	},
	onLoad: function() {
		// 获取用户的 OpenID
		wx.login({
		  success: res => {
			// 发送 res.code 到后端换取 openId
			console.log('code成功',res.code); 
			wx.request({
			  url: 'https://wendaoxiansheng.com/api/get_openid',
			  method: 'POST',
			  data: {
				code: res.code
			  },
			  success: res => {
				console.log('get_openid成功',res.data.openid); 
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
					console.log('check_user成功',res); 
					if (res.statusCode == 200) {
					  let role = res.data.role;
					  // 如果用户已注册，根据角色跳转到相应页面
					   if (role === 'Manager' || role === 'Admin' || role === 'minManager' || role === 'Visitor'|| role === 'Developer'|| role === 'manager_manager' || role === 'branch_manager') {
						wx.redirectTo({
						  url: '/pages/index/index'
						});
					  } else if (role === 'preManager' || role === 'preminManager' || role === 'preAdmin' || role === 'preVisitor'|| role === 'premanager_manager' || role === 'prebranch_manager') {
						wx.showModal({
						  title: '提示',
						  content: '您已提交过审核，请联系管理员',
						  showCancel: false
						});
					  } else {
						// 如果用户未注册，显示注册表单并等待用户提交
						this.setData({
						  showRegisterForm: true
						});
					  }
					  
					} else {
					  // HTTP 状态码不是 200，显示错误消息
					  wx.showModal({
						title: '错误',
						content: `check_user失败，返回的状态码是 ${res.statusCode}，请稍后再试。`,
						showCancel: false
					  });
					  
					}
				  }
				});
				}else {
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
	bindPickerChange: function(e) {
		this.setData({
		  roleIndex: e.detail.value
		});
	  },
	  
	// 用户提交注册表单
	register: function(e) {
	    let openid = this.data.openid;
		let name = e.detail.value.name;
		let roleIndex = this.data.roleIndex;
		// 如果 id、name 或 roleIndex 不存在，显示错误消息并返回
		if (!openid || !name || roleIndex < 0) {
		  wx.showModal({
			title: '错误',
			content: '请填写所有的字段。',
			showCancel: false
		  });
		  return;
        }
		let role = this.data.backroles[roleIndex];  // 使用 roleIndex 获取角色
	  // 发送注册信息到后端
	  wx.request({
		url: 'https://wendaoxiansheng.com/api/register',
		method: 'POST',
		data: {
		  openid: openid,
		  name: name,
		  role: role
		},
		success: res => {
            wx.showModal({
                title: '申请提交成功',
                content: '请联系管理员审核',
                showCancel: false
              });
		}
	  });
	},
	
  });
  