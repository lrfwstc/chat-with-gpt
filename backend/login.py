#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify, send_file, make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.urls import url_quote
from docx import Document

import matplotlib.pyplot as plt
from pandas.plotting import table
import matplotlib.font_manager

import tempfile
import datetime
import pandas as pd
import io
import os
import threading
import string

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:bdthznb666@172.17.0.2/wechat_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_POOL_SIZE'] = 200  # 设置连接池大小为 20


db = SQLAlchemy(app)

fonts = matplotlib.font_manager.findSystemFonts(fontpaths=None, fontext='ttf')
font_names = [matplotlib.font_manager.get_font(f).family_name for f in fonts]
plt.rcParams['font.sans-serif'] = ['WenQuanYi Micro Hei']

def excel_to_image(df, image_file):
    print(font_names)
    plt.rcParams['axes.unicode_minus'] = False  # 解决保存图像是负号'-'显示为方块的问题。

    fig, ax = plt.subplots(figsize=(12, 4)) # set size frame
    ax.xaxis.set_visible(False)  # hide the x axis
    ax.yaxis.set_visible(False)  # hide the y axis
    ax.set_frame_on(False)  # no visible frame
    tabla = table(ax, df, loc='center', cellLoc = 'center')  # where df is your data frame
    tabla.auto_set_font_size(False) # Activate set fontsize manually
    tabla.set_fontsize(10) # if ++fontsize is necessary ++colWidths
    tabla.scale(1.2, 1.2) # Table size (colWidths)
    plt.savefig(image_file)
    plt.close()

class User(db.Model):
    __tablename__ = 'User'
    wechat_id = db.Column(db.String(255), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('Manager','Admin','minManager','Visitor','preManager','preminManager','preAdmin','preVisitor','Developer','manager_manager', 'branch_manager'), nullable=False)

class Worklog(db.Model):
    __tablename__ = 'Worklog'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    wechat_id = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date)
    public_deposit_balance = db.Column(db.Float)
    public_deposit_day_increase = db.Column(db.Float)
    public_deposit_year_increase = db.Column(db.Float)
    public_deposit_change_detail = db.Column(db.Text)
    public_effective_account_balance = db.Column(db.Float)
    public_effective_account_day_increase = db.Column(db.Float)
    public_effective_account_base_increase = db.Column(db.Float)
    public_effective_account_change_detail = db.Column(db.Text)
    deposit_value_customer_balance = db.Column(db.Float)
    deposit_value_customer_day_increase = db.Column(db.Float)
    deposit_value_customer_base_increase = db.Column(db.Float)
    deposit_value_customer_change_detail = db.Column(db.Text)
    digital_currency_active_account_balance = db.Column(db.Float)
    digital_currency_active_account_day_increase = db.Column(db.Float)
    digital_currency_active_account_base_increase = db.Column(db.Float)
    digital_currency_active_account_change_detail = db.Column(db.Text)
    forecast_public_deposit_balance = db.Column(db.Float)
    forecast_public_deposit_year_increase = db.Column(db.Float)
    forecast_public_effective_account = db.Column(db.Float)
    forecast_public_effective_account_base_increase = db.Column(db.Float)
    forecast_deposit_value_customer = db.Column(db.Float)
    forecast_deposit_value_customer_base_increase = db.Column(db.Float)
    new_customer_visit_name = db.Column(db.Text)
    new_customer_visit_position = db.Column(db.Text)
    new_customer_visit_matters = db.Column(db.Text)
    chart_battle_customer_visit_name = db.Column(db.Text)
    chart_battle_customer_visit_position = db.Column(db.Text)
    chart_battle_customer_visit_matters = db.Column(db.Text)
    other_customer_visit_name = db.Column(db.Text)
    other_customer_visit_position = db.Column(db.Text)
    other_customer_visit_matters = db.Column(db.Text)
    other_work = db.Column(db.Text)
    name = db.Column(db.String(255), nullable=False)
    



@app.route('/api/export_worklog', methods=['GET'])
def export_worklog():
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')

    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None

    if start_date and end_date:
        worklogs = Worklog.query.filter(Worklog.date.between(start_date, end_date)).all()
    else:
        worklogs = Worklog.query.all()

    # 将这些数据转换为一个pandas DataFrame
    data = pd.DataFrame([worklog.__dict__ for worklog in worklogs])

    # Convert the 'date' column to string format
    data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else '')

    # 显式地指定列的顺序
    columns_order = ['id', 'wechat_id', 'date', 'name', 'public_deposit_balance', 'public_deposit_day_increase', 
                     'public_deposit_year_increase', 'public_deposit_change_detail', 'public_effective_account_balance',
                     'public_effective_account_day_increase', 'public_effective_account_base_increase', 
                     'public_effective_account_change_detail', 'deposit_value_customer_balance',
                     'deposit_value_customer_day_increase', 'deposit_value_customer_base_increase', 
                     'deposit_value_customer_change_detail', 'digital_currency_active_account_balance',
                     'digital_currency_active_account_day_increase', 'digital_currency_active_account_base_increase',
                     'digital_currency_active_account_change_detail', 'forecast_public_deposit_balance',
                     'forecast_public_deposit_year_increase', 'forecast_public_effective_account',
                     'forecast_public_effective_account_base_increase', 'forecast_deposit_value_customer',
                     'forecast_deposit_value_customer_base_increase', 'new_customer_visit_name',
                     'new_customer_visit_position','new_customer_visit_matters', 'chart_battle_customer_visit_name',
                     'chart_battle_customer_visit_position', 'chart_battle_customer_visit_matters',
                     'other_customer_visit_name', 'other_customer_visit_position', 'other_customer_visit_matters',
                     'other_work']
    data = data[columns_order]

    # 移动 'name' 列到最前面
    # name = data.pop('name')
    # data.insert(0, 'name', name)

    # 删除 'id' 列
    data = data.drop('id', axis=1)
    data = data.drop('wechat_id', axis=1)
    # 重命名 'public_deposit_change_detail' 列
    data = data.rename(columns={
        'date': '日期',
        'name': '姓名',
        'public_deposit_balance': '存款余额',
        'public_deposit_day_increase': '存款日增量',
        'public_deposit_year_increase': '存款年增量',
        'public_deposit_change_detail': '存款变动明细',
        'public_effective_account_balance': '有效户',
        'public_effective_account_day_increase': '有效户日增量',
        'public_effective_account_base_increase': '有效户年增量',
        'public_effective_account_change_detail': '有效户变动明细',
        'deposit_value_customer_balance': '存款价值客户',
        'deposit_value_customer_day_increase': '存款价值客户日增量',
        'deposit_value_customer_base_increase': '存款价值客户年增量',
        'deposit_value_customer_change_detail': '存款价值客户变动明细',
        'digital_currency_active_account_balance': '数币活户',
        'digital_currency_active_account_day_increase': '数币活户日增量',
        'digital_currency_active_account_base_increase': '数币活户年增量',
        'digital_currency_active_account_change_detail': '数币活户变动明细',
        'forecast_public_deposit_balance': '预测存款余额',
        'forecast_public_deposit_year_increase': '预测存款年增量',
        'forecast_public_effective_account': '预测对公有效户',
        'forecast_public_effective_account_base_increase': '预测对公有效户年增量',
        'forecast_deposit_value_customer': '预测存款价值客户',
        'forecast_deposit_value_customer_base_increase': '预测存款价值客户年增量',
        'new_customer_visit_name': '拜访新户名称',
        'new_customer_visit_position': '新客户拜访姓名职务',
        'new_customer_visit_matters': '新客户拜访事项',
        'chart_battle_customer_visit_name': '拜访挂图作战客户名称',
        'chart_battle_customer_visit_position': '挂图作战客户拜访姓名职务',
        'chart_battle_customer_visit_matters': '挂图作战客户拜访事项',
        'other_customer_visit_name': '拜访其他客户名称',
        'other_customer_visit_position': '其他客户拜访姓名职务',
        'other_customer_visit_matters': '其他客户拜访事项',
        'other_work': '其他工作'
    })

    def custom_len(s):
        length = 0
        for char in s:
            if '\u4e00' <= char <= '\u9fff':  # 判断是否为中文字符
                length += 2
            else:
                length += 1
        return length

    # 创建一个Excel文件
    excel_file = io.BytesIO()
    with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
        data.to_excel(writer, sheet_name='Sheet1', index=False)
        worksheet = writer.sheets['Sheet1']

        # 创建一个格式对象，用于设置单元格的对齐方式
        cell_format = writer.book.add_format()
        cell_format.set_align('left')  # 设置单元格为左对齐

        for idx, col in enumerate(data):
            series = data[col]
            max_len = max((
                series.astype(str).map(custom_len).max(),
                custom_len(str(series.name))
            ))
            max_len = max_len * 1 + 1

            # 使用set_column方法设置列的宽度和对齐方式
            # 注意这里设置的行范围从1开始，以避开第一行（标题行）
            worksheet.set_column(idx, idx, max_len, cell_format)

    excel_file.seek(0)

    return send_file(excel_file, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, attachment_filename='worklog.xlsx')


@app.route('/api/export_worklog_priority', methods=['GET'])
def export_worklog_priority():
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')

    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None

    if start_date and end_date:
        worklogs = Worklog.query.filter(Worklog.date.between(start_date, end_date)).all()
    else:
        return "No date provided."

    # 将这些数据转换为一个pandas DataFrame
    data = pd.DataFrame([worklog.__dict__ for worklog in worklogs])

    # Convert the 'date' column to string format
    data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else '')

    # Decide the columns based on whether startDate is the same as endDate
    if start_date != end_date:
        columns_needed = ['name', 'date', 'public_deposit_balance', 'public_deposit_day_increase', 'public_deposit_year_increase', 'public_deposit_change_detail']
    else:
        columns_needed = ['name', 'public_deposit_balance', 'public_deposit_day_increase', 'public_deposit_year_increase', 'public_deposit_change_detail']
    data = data[columns_needed]

    # 对数据根据'public_deposit_day_increase'进行降序排列
    data = data.sort_values('public_deposit_day_increase', ascending=False)

    # 重命名列
    columns_dict = {
        'name': '姓名',
        'date': '日期',
        'public_deposit_balance': '存款余额',
        'public_deposit_day_increase': '存款日增量',
        'public_deposit_year_increase': '存款年增量',
        'public_deposit_change_detail': '存款变动明细',
    }
    columns_dict = {key: value for key, value in columns_dict.items() if key in columns_needed}  # Only keep those needed
    data = data.rename(columns=columns_dict)

    def custom_len(s):
        length = 0
        for char in s:
            if '\u4e00' <= char <= '\u9fff':  # 判断是否为中文字符
                length += 2
            else:
                length += 1
        return length

    # 创建一个Excel文件
    excel_file = io.BytesIO()
    with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
        data.to_excel(writer, sheet_name='Sheet1', index=False, startrow=1)
        worksheet = writer.sheets['Sheet1']

        # 创建一个格式对象，用于设置单元格的对齐方式
        cell_format = writer.book.add_format()
        cell_format.set_align('left')  # 设置单元格为左对齐

        for idx, col in enumerate(data):
            series = data[col]
            max_len = max((
                series.astype(str).map(custom_len).max(),
                custom_len(str(series.name))
            ))
            max_len = max_len * 1 + 1

            # 使用set_column方法设置列的宽度和对齐方式
            # 注意这里设置的行范围从1开始，以避开第一行（标题行）
            worksheet.set_column(idx, idx, max_len, cell_format)

        # 添加标题行，合并1-5列单元格并居中显示
        title = start_date_str + " ~ " + end_date_str + " " + "重点工作" if start_date_str != end_date_str else start_date_str + " " + "重点工作"
        title_format = writer.book.add_format({
        'align': 'center',
        'bold': True,
        'font_size': 14,
        'border': 1
        })
        worksheet.merge_range('A1:F1', title, title_format)

    excel_file.seek(0)

    return send_file(excel_file, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, attachment_filename='worklog.xlsx')




@app.route('/api/export_worklog_effective_account', methods=['GET'])
def export_worklog_effective_account():
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')

    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None

    if start_date and end_date:
        worklogs = Worklog.query.filter(Worklog.date.between(start_date, end_date)).all()
    else:
        return "No date provided."

    # 将这些数据转换为一个pandas DataFrame
    data = pd.DataFrame([worklog.__dict__ for worklog in worklogs])

    # Convert the 'date' column to string format
    data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else '')

    # Decide the columns based on whether startDate is the same as endDate
    if start_date != end_date:
        columns_needed = ['name', 'date', 'public_effective_account_balance', 'public_effective_account_day_increase', 'public_effective_account_base_increase', 'public_effective_account_change_detail']
    else:
        columns_needed = ['name', 'public_effective_account_balance', 'public_effective_account_day_increase', 'public_effective_account_base_increase', 'public_effective_account_change_detail']
    data = data[columns_needed]

    # 对数据根据'public_effective_account_day_increase'进行降序排列
    data = data.sort_values('public_effective_account_day_increase', ascending=False)

    # 重命名列
    columns_dict = {
        'name': '姓名',
        'date': '日期',
        'public_effective_account_balance': '有效户',
        'public_effective_account_day_increase': '有效户日增量',
        'public_effective_account_base_increase': '有效户年增量',
        'public_effective_account_change_detail': '有效户变动明细',
    }
    columns_dict = {key: value for key, value in columns_dict.items() if key in columns_needed}  # Only keep those needed
    data = data.rename(columns=columns_dict)

    def custom_len(s):
        length = 0
        for char in s:
            if '\u4e00' <= char <= '\u9fff':  # 判断是否为中文字符
                length += 2
            else:
                length += 1
        return length

    # 创建一个Excel文件
    excel_file = io.BytesIO()
    with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
        data.to_excel(writer, sheet_name='Sheet1', index=False, startrow=1)
        worksheet = writer.sheets['Sheet1']

        # 创建一个格式对象，用于设置单元格的对齐方式
        cell_format = writer.book.add_format()
        cell_format.set_align('left')  # 设置单元格为左对齐

        for idx, col in enumerate(data):
            series = data[col]
            max_len = max((
                series.astype(str).map(custom_len).max(),
                custom_len(str(series.name))
            ))
            max_len = max_len * 1 + 1

            # 使用set_column方法设置列的宽度和对齐方式
            # 注意这里设置的行范围从1开始，以避开第一行（标题行）
            worksheet.set_column(idx, idx, max_len, cell_format)

        # 创建一个格式对象，用于设置标题行的样式
        title_format = writer.book.add_format({
            'align': 'center',
            'bold': True,
            'font_size': 14,
            'border': 1
        })

        # 添加标题行，合并单元格并居中显示
        if start_date != end_date:
            title = start_date_str + " ~ " + end_date_str + " " + "有效户"
            worksheet.merge_range('A1:F1', title, title_format)
        else:
            title = start_date_str + " " + "有效户"
            worksheet.merge_range('A1:E1', title, title_format)

    excel_file.seek(0)

    return send_file(excel_file, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, attachment_filename='worklog_effective_account.xlsx')




@app.route('/api/export_worklog_client_visit', methods=['GET'])
def export_worklog_client_visit():
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')

    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None

    if start_date and end_date:
        worklogs = Worklog.query.filter(Worklog.date.between(start_date, end_date)).all()
    else:
        return "No date provided."

    # 将这些数据转换为一个pandas DataFrame
    data = pd.DataFrame([worklog.__dict__ for worklog in worklogs])

    # Convert the 'date' column to string format
    data['date'] = data['date'].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else '')

    # Decide the columns based on whether startDate is the same as endDate
    if start_date != end_date:
        columns_needed = ['name', 'date', 'new_customer_visit_name','new_customer_visit_matters', 'chart_battle_customer_visit_name', 'chart_battle_customer_visit_matters', 'other_customer_visit_name', 'other_customer_visit_matters','other_work']
    else:
        columns_needed = ['name', 'new_customer_visit_name','new_customer_visit_matters', 'chart_battle_customer_visit_name', 'chart_battle_customer_visit_matters', 'other_customer_visit_name', 'other_customer_visit_matters','other_work']
    data = data[columns_needed]

    # 重命名列
    columns_dict = {
        'name': '姓名',
        'date': '日期',
        'new_customer_visit_name': '新户名称',
        'new_customer_visit_matters': '新户详情',
        'chart_battle_customer_visit_name': '挂图客户',
        'chart_battle_customer_visit_matters': '详情',
        'other_customer_visit_name': '其他客户名称',
        'other_customer_visit_matters': '其他客户详情',
        'other_work':'其他',
    }
    columns_dict = {key: value for key, value in columns_dict.items() if key in columns_needed}  # Only keep those needed
    data = data.rename(columns=columns_dict)

    # 创建一个Excel文件
    excel_file = io.BytesIO()
    with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
        data.to_excel(writer, sheet_name='Sheet1', index=False, startrow=1)
        worksheet = writer.sheets['Sheet1']

        # 创建一个格式对象，用于设置单元格的对齐方式和字体大小
        cell_format = writer.book.add_format({
            'align': 'left',  # 设置单元格为左对齐
            'font_size': 7,  # 将字体大小设置为7
            'text_wrap': True  # 设置文本自动换行
        })

        # 手动设置每一列的列宽
        if start_date != end_date:
            column_widths = [4, 8, 8, 8, 8, 8, 15, 15, 45]  # 修改为你所需要的列宽
        else:
            column_widths = [4, 10, 10, 10, 10, 12, 12, 40, 0.1]  # 修改为你所需要的列宽
        
        for idx, width in enumerate(column_widths):
            worksheet.set_column(idx, idx, width, cell_format)

        # 设置行高
        worksheet.set_default_row(15)  # 将行高设置为15，这个值可能需要根据你的实际需求进行调整

        # 添加标题行，合并1-9列单元格并居中显示
        title = start_date_str + " ~ " + end_date_str + " " + "客户拜访工作" if start_date_str != end_date_str else start_date_str + " " + "客户拜访工作"
        title_format = writer.book.add_format({
            'align': 'center',
            'bold': True,
            'font_size': 7,
            'border': 1
        })
        worksheet.merge_range('A1:I1', title, title_format)

         # 创建一个新的格式对象，用于设置列标题的字体大小
        header_format = writer.book.add_format({
            'font_size': 7,  # 将列标题的字体大小设置为7
            'bold': True,
            'align': 'center',
            'border': 1
        })

        # 将新的格式应用到列标题
        for idx, col in enumerate(data.columns):
            worksheet.write(1, idx, col, header_format)

    excel_file.seek(0)

    image_file = 'worklog_client_visit.png'
    excel_to_image(data, image_file)

    return send_file(image_file, mimetype='image/png')



@app.route('/api/add_worklog', methods=['POST'])
def add_worklog():
    worklog_info = request.json

    # 查询数据库是否有相同name和date的数据
    old_worklog = Worklog.query.filter_by(
        name=worklog_info['manager_name'], 
        date=worklog_info['date']
    ).first()

    # 如果找到匹配的数据，删除它
    if old_worklog:
        db.session.delete(old_worklog)
        db.session.commit()

    new_worklog = Worklog(
        wechat_id=worklog_info['openid'],
        date=worklog_info['date'],
        public_deposit_balance=worklog_info['public_deposit_balance'],
        public_deposit_day_increase=worklog_info['public_deposit_day_increase'],
        public_deposit_year_increase=worklog_info['public_deposit_year_increase'],
        public_deposit_change_detail=worklog_info['public_deposit_change_detail'],
        public_effective_account_balance=worklog_info['public_effective_account_balance'],
        public_effective_account_day_increase=worklog_info['public_effective_account_day_increase'],
        public_effective_account_base_increase=worklog_info['public_effective_account_base_increase'],
        public_effective_account_change_detail=worklog_info['public_effective_account_change_detail'],
        deposit_value_customer_balance=worklog_info['deposit_value_customer_balance'],
        deposit_value_customer_day_increase=worklog_info['deposit_value_customer_day_increase'],
        deposit_value_customer_base_increase=worklog_info['deposit_value_customer_base_increase'],
        deposit_value_customer_change_detail=worklog_info['deposit_value_customer_change_detail'],
        digital_currency_active_account_balance=worklog_info['digital_currency_active_account_balance'],
        digital_currency_active_account_day_increase=worklog_info['digital_currency_active_account_day_increase'],
        digital_currency_active_account_base_increase=worklog_info['digital_currency_active_account_base_increase'],
        digital_currency_active_account_change_detail=worklog_info['digital_currency_active_account_change_detail'],
        forecast_public_deposit_balance=worklog_info['public_deposit_forecast_balance'],
        forecast_public_deposit_year_increase=worklog_info['public_deposit_forecast_year_increase'],
        forecast_public_effective_account=worklog_info['public_effective_account_forecast'],
        forecast_public_effective_account_base_increase=worklog_info['public_effective_account_forecast_base_increase'],
        forecast_deposit_value_customer=worklog_info['deposit_value_customer_forecast'],
        forecast_deposit_value_customer_base_increase=worklog_info['deposit_value_customer_forecast_base_increase'],
        new_customer_visit_name=worklog_info['new_customer_visit_name'],
        new_customer_visit_position=worklog_info['new_customer_visit_position'],
        new_customer_visit_matters=worklog_info['new_customer_visit_matters'],
        chart_battle_customer_visit_name=worklog_info['chart_battle_customer_visit_name'],
        chart_battle_customer_visit_position=worklog_info['chart_battle_customer_visit_position'],
        chart_battle_customer_visit_matters=worklog_info['chart_battle_customer_visit_matters'],
        other_customer_visit_name=worklog_info['other_customer_visit_name'],
        other_customer_visit_position=worklog_info['other_customer_visit_position'],
        other_customer_visit_matters=worklog_info['other_customer_visit_matters'],
        other_work=worklog_info['other_work'],
        name=worklog_info['manager_name']
    )
    db.session.add(new_worklog)
    db.session.commit()

    # 如果旧的数据被覆盖，返回一个特定的消息
    if old_worklog:
        return jsonify({'status': 'success', 'message': 'New data has overwritten old data'})
    else:
        return jsonify({'status': 'success', 'message': 'New data has been added'})

@app.route('/api/get_recent_worklog', methods=['POST'])
def get_recent_worklog():
    worklog_info = request.json
    wechat_id = worklog_info['openid']
    recent_worklog = Worklog.query.filter_by(wechat_id=wechat_id).order_by(Worklog.date.desc()).first()
    if recent_worklog is None:
        return jsonify({})
    else:
        return jsonify({
            'public_deposit_balance': recent_worklog.public_deposit_balance,
            'public_deposit_day_increase': recent_worklog.public_deposit_day_increase,
            'public_deposit_year_increase': recent_worklog.public_deposit_year_increase,
            'public_deposit_change_detail': recent_worklog.public_deposit_change_detail,
            'public_effective_account_balance': recent_worklog.public_effective_account_balance,
            'public_effective_account_day_increase': recent_worklog.public_effective_account_day_increase,
            'public_effective_account_base_increase': recent_worklog.public_effective_account_base_increase,
            'public_effective_account_change_detail': recent_worklog.public_effective_account_change_detail,
            'deposit_value_customer_balance': recent_worklog.deposit_value_customer_balance,
            'deposit_value_customer_day_increase': recent_worklog.deposit_value_customer_day_increase,
            'deposit_value_customer_base_increase': recent_worklog.deposit_value_customer_base_increase,
            'deposit_value_customer_change_detail': recent_worklog.deposit_value_customer_change_detail,
            'digital_currency_active_account_balance': recent_worklog.digital_currency_active_account_balance,
            'digital_currency_active_account_day_increase': recent_worklog.digital_currency_active_account_day_increase,
            'digital_currency_active_account_base_increase': recent_worklog.digital_currency_active_account_base_increase,
            'digital_currency_active_account_change_detail': recent_worklog.digital_currency_active_account_change_detail,
            'public_deposit_forecast_balance': recent_worklog.forecast_public_deposit_balance,
            'public_deposit_forecast_year_increase': recent_worklog.forecast_public_deposit_year_increase,
            'public_effective_account_forecast': recent_worklog.forecast_public_effective_account,
            'public_effective_account_forecast_base_increase': recent_worklog.forecast_public_effective_account_base_increase,
            'deposit_value_customer_forecast': recent_worklog.forecast_deposit_value_customer,
            'deposit_value_customer_forecast_base_increase': recent_worklog.forecast_deposit_value_customer_base_increase,
            'new_customer_visit_name': recent_worklog.new_customer_visit_name,
            'new_customer_visit_position': recent_worklog.new_customer_visit_position,
            'new_customer_visit_matters': recent_worklog.new_customer_visit_matters,
            'chart_battle_customer_visit_name': recent_worklog.chart_battle_customer_visit_name,
            'chart_battle_customer_visit_position': recent_worklog.chart_battle_customer_visit_position,
            'chart_battle_customer_visit_matters': recent_worklog.chart_battle_customer_visit_matters,
            'other_customer_visit_name': recent_worklog.other_customer_visit_name,
            'other_customer_visit_position': recent_worklog.other_customer_visit_position,
            'other_customer_visit_matters': recent_worklog.other_customer_visit_matters,
            'other_work': recent_worklog.other_work,
            'manager_name': recent_worklog.name
        })

@app.route('/api/worklog_check', methods=['POST'])
def worklog_check():
    data = request.get_json()
    date= data['date']
    name = data['name']

    response = {}
    worklog_exists = db.session.query(Worklog.query.filter_by(name=name, date=date).exists()).scalar()
    response[name] = worklog_exists

    return jsonify(response)

@app.route('/api/worklog_check_bulk', methods=['POST'])
def check_worklogs():
    names = request.json['names']
    date = request.json['date']
    date_obj = datetime.datetime.strptime(date, "%Y-%m-%d").date()
    users_exist_dict = {}
    for name in names:
        worklog = Worklog.query.filter_by(name=name, date=date_obj).first()
        users_exist_dict[name] = '有' if worklog is not None else '无'
    return jsonify(users_exist_dict)



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

@app.route('/api/exchange_user', methods=['POST'])
def exchange_user():
    wechat_id = request.json.get('id')
    user = User.query.filter_by(wechat_id=wechat_id).first()
    if user is None:
        return jsonify({'status': 'error', 'message': 'User not found'})

    if user.role.startswith('pre'):
        user.role = user.role[3:]  # Remove the 'pre' prefix

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

@app.route('/api/get_log_file', methods=['GET'])
def get_log_file():
    # 读取nohup.out文件
    with open('/root/wechat_project/nohup.out', 'r') as file:
        data = file.read()

    # 创建一个转换表，只保留兼容的字符
    cleaned_data = ''.join(ch for ch in data if ch.isprintable() and ch != '\n' and ch != '\r')

    # 将清洗后的数据转换为.docx文件
    doc = Document()
    doc.add_paragraph(cleaned_data)
    doc.save('/tmp/nohup.docx')

    # 创建一个定时器，5分钟后删除.docx文件
    threading.Timer(300, delete_file, args=('/tmp/nohup.docx',)).start()

    # 返回.docx文件
    return send_file('/tmp/nohup.docx', as_attachment=True, attachment_filename='nohup.docx', mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')

def delete_file(path):
    if os.path.exists(path):
        os.remove(path)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
