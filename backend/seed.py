import os
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/test_db")
client = MongoClient(MONGO_URL)
db = client.get_database()

# Clear existing collections
db.users.delete_many({})
db.tasks.delete_many({})
db.activities.delete_many({})

palette = ["#6366f1", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"]

def generate_avatar(name, idx):
    bg = palette[idx % len(palette)].replace("#", "")
    return f"https://api.dicebear.com/9.x/initials/svg?seed={name.replace(' ', '%20')}&backgroundColor={bg}&textColor=ffffff"

users_data = [
    { "id": "u1", "name": "Sarah Chen", "email": "sarah@taskflow.app", "role": "Product Manager", "online": True, "activeTasks": 8, "completedTasks": 142 },
    { "id": "u2", "name": "Marcus Reid", "email": "marcus@taskflow.app", "role": "Engineering Lead", "online": True, "activeTasks": 12, "completedTasks": 201 },
    { "id": "u3", "name": "Priya Sharma", "email": "priya@taskflow.app", "role": "Designer", "online": False, "activeTasks": 5, "completedTasks": 89 },
    { "id": "u4", "name": "Diego Alvarez", "email": "diego@taskflow.app", "role": "Frontend Dev", "online": True, "activeTasks": 9, "completedTasks": 124 },
]

for i, u in enumerate(users_data):
    u['avatar'] = generate_avatar(u['name'], i)

db.users.insert_many(users_data)

titles = [
    "Design onboarding flow v3",
    "Refactor billing service",
    "Quarterly investor report",
    "Migrate analytics pipeline",
    "Customer interviews \u2014 cohort 4"
]

priorities = ["low", "medium", "high", "urgent"]
statuses = ["pending", "in-progress", "completed", "overdue"]
recurrences = ["one-time", "daily", "weekly", "monthly", "custom"]
tags = ["Design", "Engineering", "Marketing", "Ops", "Finance"]

today = datetime.datetime.now()

tasks_data = []
for i, t in enumerate(titles):
    due_date = today + datetime.timedelta(days=(i % 14) - 4)
    tasks_data.append({
        "id": f"t{i + 1}",
        "title": t,
        "description": "Coordinate with stakeholders, define the scope, and ship within the agreed window.",
        "assignee": users_data[i % len(users_data)],
        "dueDate": due_date.isoformat() + "Z",
        "priority": priorities[i % len(priorities)],
        "status": statuses[i % len(statuses)],
        "recurrence": recurrences[i % len(recurrences)],
        "progress": [10, 25, 45, 60, 80][i % 5],
        "reminder": i % 3 == 0,
        "tags": [tags[i % len(tags)], tags[(i + 3) % len(tags)]],
    })

db.tasks.insert_many(tasks_data)

activities_data = [
    { "id": 1, "user": users_data[0], "action": "completed", "target": "Design onboarding flow v3", "time": "2m ago" },
    { "id": 2, "user": users_data[1], "action": "commented on", "target": "Refactor billing service", "time": "14m ago" },
    { "id": 3, "user": users_data[3], "action": "created", "target": "Launch landing page A/B test", "time": "1h ago" },
]

db.activities.insert_many(activities_data)

print("Database seeded successfully with Users, Tasks, and Activities!")
