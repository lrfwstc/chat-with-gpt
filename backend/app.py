from flask import Flask, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, origins=["https://wendaoxiansheng.com", "https://www.wendaoxiansheng.com"])

# 替换为您的 AppID 和 AppSecret
APP_ID = 'wx70b91e7f81861543'
APP_SECRET = 'c994bfd5aeeee3bb2bca98ea43e0f96f'

# 创建一个名为 get_openid 的 Flask 路由，用于接收来自微信小程序的 code
@app.route('/api/get_openid', methods=['POST'])
def get_openid():
    # 从请求中获取 code
    code = request.form.get('code')

    # 构造用于获取 openid 的微信 API 请求 URL
    url = f'https://api.weixin.qq.com/sns/jscode2session?appid={APP_ID}&secret={APP_SECRET}&js_code={code}&grant_type=authorization_code'

    # 向微信 API 发送请求并获取响应
    response = requests.get(url)
    data = response.json()

    # 从响应数据中提取 openid
    openid = data['openid']

    # 将 openid 返回给小程序
    return {'openid': openid}

# 运行 Flask 应用程序
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
