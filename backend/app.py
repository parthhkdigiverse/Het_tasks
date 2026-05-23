import os
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from the root .env file (works locally; on Vercel, env vars are set in dashboard)
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/test_db")
try:
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    print("Connected to MongoDB successfully!")
except Exception as e:
    print("Failed to connect to MongoDB:", e)

from bson import json_util
import json

def parse_json(data):
    return json.loads(json_util.dumps(data))

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Flask backend is running"}), 200

@app.route('/api/users', methods=['GET'])
def get_users():
    users = list(db.users.find({}, {'_id': False}))
    return jsonify(users)

import uuid

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    if not data or not data.get('name') or not data.get('email') or not data.get('role') or not data.get('password'):
        return jsonify({"status": "error", "message": "Missing required fields"}), 400
        
    new_user = {
        "id": f"u{str(uuid.uuid4())[:8]}",
        "name": data.get('name'),
        "email": data.get('email'),
        "role": data.get('role'),
        "password": data.get('password'),
        "avatar": data.get('avatar', ""),
        "online": False,
        "activeTasks": 0,
        "completedTasks": 0
    }
    
    db.users.insert_one(new_user.copy())
    return jsonify({"status": "success", "user": new_user}), 201

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    result = db.users.delete_one({"id": user_id})
    if result.deleted_count > 0:
        return jsonify({"status": "success", "message": "User deleted"}), 200
    else:
        return jsonify({"status": "error", "message": "User not found"}), 404

from flask import request

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    update_fields = {}
    if 'name' in data: update_fields['name'] = data['name']
    if 'email' in data: update_fields['email'] = data['email']
    if 'role' in data: update_fields['role'] = data['role']
    if 'password' in data and data['password']: update_fields['password'] = data['password']
    
    if not update_fields:
        return jsonify({"status": "error", "message": "No fields to update"}), 400
        
    result = db.users.update_one({"id": user_id}, {"$set": update_fields})
    if result.matched_count > 0:
        return jsonify({"status": "success", "message": "User updated"}), 200
    else:
        return jsonify({"status": "error", "message": "User not found"}), 404

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400
        
    user = db.users.find_one({"email": email, "password": password}, {'_id': False})
    if user:
        return jsonify({"status": "success", "user": user}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = list(db.tasks.find({}, {'_id': False, 'assignee._id': False, 'assignedBy._id': False}))
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    if not data or not data.get('title'):
        return jsonify({"status": "error", "message": "Title is required"}), 400
        
    assignee_id = data.get('assigneeId')
    assignee = None
    if assignee_id:
        assignee = db.users.find_one({"id": assignee_id}, {'_id': False})
    
    if not assignee:
        assignee = {"name": "Unassigned", "avatar": ""}
        
    assigned_by_id = data.get('assignedById')
    assigned_by = None
    if assigned_by_id:
        assigned_by = db.users.find_one({"id": assigned_by_id}, {'_id': False})
        
    if not assigned_by:
        assigned_by = {"name": "System", "avatar": ""}
        
    import datetime
    new_task = {
        "id": f"t{str(uuid.uuid4())[:8]}",
        "title": data.get('title'),
        "description": data.get('description', ""),
        "status": data.get('status', "pending"),
        "priority": data.get('priority', "medium"),
        "assignee": assignee,
        "assignedBy": assigned_by,
        "createdAt": datetime.datetime.now().isoformat() + "Z",
        "dueDate": data.get('dueDate', (datetime.datetime.now() + datetime.timedelta(days=1)).isoformat() + "Z"),
        "recurrence": data.get('recurrence', "one-time"),
        "carryOver": data.get('carryOver', False),
        "reminder": data.get('reminder', False),
        "comments": 0,
        "attachments": 0,
        "tags": data.get('tags', [])
    }
    
    db.tasks.insert_one(new_task.copy())
    return jsonify({"status": "success", "task": new_task}), 201

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    result = db.tasks.delete_one({"id": task_id})
    if result.deleted_count > 0:
        return jsonify({"status": "success", "message": "Task deleted"}), 200
    else:
        return jsonify({"status": "error", "message": "Task not found"}), 404

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    update_fields = {}
    
    if 'title' in data: update_fields['title'] = data['title']
    if 'description' in data: update_fields['description'] = data['description']
    if 'status' in data: update_fields['status'] = data['status']
    if 'priority' in data: update_fields['priority'] = data['priority']
    
    if 'assigneeId' in data:
        if data['assigneeId']:
            assignee = db.users.find_one({"id": data['assigneeId']}, {'_id': False})
            if assignee: update_fields['assignee'] = assignee
        else:
            update_fields['assignee'] = {"name": "Unassigned", "avatar": ""}
            
    if not update_fields:
        return jsonify({"status": "error", "message": "No fields to update"}), 400
        
    result = db.tasks.update_one({"id": task_id}, {"$set": update_fields})
    if result.matched_count > 0:
        return jsonify({"status": "success", "message": "Task updated"}), 200
    else:
        return jsonify({"status": "error", "message": "Task not found"}), 404

@app.route('/api/activities', methods=['GET'])
def get_activities():
    activities = list(db.activities.find({}, {'_id': False, 'user._id': False}))
    return jsonify(activities)
@app.route('/api/dashboard_metrics', methods=['GET'])
def get_dashboard_metrics():
    import datetime
    now = datetime.datetime.now()
    tasks = list(db.tasks.find({}))
    total_users = db.users.count_documents({})
    
    today_tasks_count = 0
    this_week_tasks_count = 0
    completed_count = 0
    pending_count = 0
    in_progress_count = 0
    overdue_count = 0
    
    for t in tasks:
        status = t.get('status', 'pending')
        due_date = t.get('dueDate', '')
        
        if status == 'completed':
            completed_count += 1
        elif status == 'pending':
            pending_count += 1
        elif status == 'in-progress':
            in_progress_count += 1
            
        if due_date:
            try:
                if due_date == 'Tomorrow':
                    due_date_obj = now + datetime.timedelta(days=1)
                else:
                    due_date_obj = datetime.datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                
                if due_date_obj.date() == now.date():
                    today_tasks_count += 1
                if now.date() <= due_date_obj.date() <= (now + datetime.timedelta(days=7)).date():
                    this_week_tasks_count += 1
                if due_date_obj.date() < now.date() and status != 'completed':
                    overdue_count += 1
            except Exception:
                pass

    kpis = {
        "todayTasks": today_tasks_count,
        "thisWeekTasks": this_week_tasks_count,
        "completedTasks": completed_count,
        "pendingTasks": pending_count,
        "overdueTasks": overdue_count,
        "totalUsers": total_users
    }

    taskDistribution = [
        {"name": "Completed", "value": completed_count, "color": "#10b981"},
        {"name": "In Progress", "value": in_progress_count, "color": "#3b82f6"},
        {"name": "Pending", "value": pending_count, "color": "#f59e0b"},
        {"name": "Overdue", "value": overdue_count, "color": "#ef4444"},
    ]

    weeklyCompletion = []
    for i in range(6, -1, -1):
        target_date = now - datetime.timedelta(days=i)
        day_str = target_date.strftime("%a")
        created_today = 0
        completed_today = 0
        for t in tasks:
            created_at = t.get('createdAt')
            if created_at:
                try:
                    c_date = datetime.datetime.fromisoformat(created_at.replace('Z', '+00:00')).date()
                    if c_date == target_date.date():
                        created_today += 1
                        if t.get('status') == 'completed':
                            completed_today += 1
                except:
                    pass
        weeklyCompletion.append({"day": day_str, "created": created_today, "completed": completed_today})

    productivityTrend = []
    for i in range(13, -1, -1):
        target_date = now - datetime.timedelta(days=i)
        score = 0
        for t in tasks:
            created_at = t.get('createdAt')
            if created_at:
                try:
                    c_date = datetime.datetime.fromisoformat(created_at.replace('Z', '+00:00')).date()
                    if c_date == target_date.date():
                        score += 10
                        if t.get('status') == 'completed':
                            score += 20
                except:
                    pass
        productivityTrend.append({"date": target_date.strftime("%b %d"), "score": score})

    return jsonify({
        "kpis": kpis,
        "productivityTrend": productivityTrend,
        "weeklyCompletion": weeklyCompletion,
        "taskDistribution": taskDistribution
    })



if __name__ == '__main__':
    port = int(os.getenv("FLASK_PORT", 5000))
    debug_mode = os.getenv("FLASK_ENV", "development") != "production"
    app.run(debug=debug_mode, host='0.0.0.0', port=port, use_reloader=False)
