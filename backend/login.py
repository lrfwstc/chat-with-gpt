#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:bdthznb666@172.17.0.2/wechat_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'User'
    wechat_id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('Manager', 'Admin'), nullable=False)


@app.route('/api/get_users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{'wechat_id': user.wechat_id, 'name': user.name, 'role': user.role} for user in users]
    return jsonify(users_list)

@app.route('/api/check_user', methods=['POST'])
def check_user():
    openid = request.json.get('openid')

    user = User.query.filter_by(wechat_id=openid).first()
    if user:
        return jsonify({'openid': openid, 'role': user.role, 'name': user.name, 'wechat_id': user.wechat_id})
    else:
        return jsonify({'openid': openid, 'role': None})

@app.route('/api/add_user', methods=['POST'])
def add_user():
    user_info = request.json
    new_user = User(wechat_id=user_info['wechat_id'], name=user_info['name'], role=user_info['role'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'status': 'success'})

@app.route('/api/delete_user', methods=['POST'])
def delete_user():
    user_id = request.json.get('id')
    print(f"打印User ID: {user_id}")  # 打印 user_id 的值
    User.query.filter_by(wechat_id = user_id).delete()
    db.session.commit()

    return jsonify({'status': 'success'})

@app.route('/api/register', methods=['POST'])
def register():
    openid = request.json.get('openid')
    name = request.json.get('name')
    role = request.json.get('role')

    new_user = User(wechat_id=openid, name=name, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
