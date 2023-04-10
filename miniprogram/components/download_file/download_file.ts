Component({
  properties: {
    // 这里定义了 innerText 属性，属性值可以在组件使用时指定
    address: {
      type: String,
      value: 'default value',
    },
    text: {
      type: String,
      value: 'default value',
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  methods: {
    // 这里是一个自定义方法
    downloadFile(){
      wx.showToast({
        title: '下载中',
        icon:"loading",
        duration:2000
      })
      let fileID = this.data.address //取data里面的fileID
      if(fileID!=null&&fileID.length>0){
        console.log("下载链接",fileID);
        wx.cloud.downloadFile({
          fileID: fileID,
          success: res => { 
            console.log("文件下载成功",res);
            //提示框
            wx.showToast({
              title: '文件下载成功',
              icon:"success",
              duration:2000
            })
    
            //打开文件
            const filePath = res.tempFilePath
            
            wx.openDocument({
              showMenu:true,
              filePath: filePath,
              success: function (res) {
                console.log('打开文档成功',res)
              }
            })
          },
        fail: err => {
            console.log("文件下载失败",err);
          }    
      })
     }else{
      wx.showToast({
        title: '下载链接为空',
        icon:"none"
      })
    }
    },
  }
})