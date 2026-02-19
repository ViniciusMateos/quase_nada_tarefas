import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_, and_
from dotenv import load_dotenv

# Carrega a senha do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app) 

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'quase_nada_tarefas.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    priority = db.Column(db.String(50), nullable=False, default='medium')
    notes = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    week_key = db.Column(db.String(20), nullable=False) 
    completed_week_key = db.Column(db.String(20), nullable=True) 
    category = db.Column(db.String(50), nullable=False, default='geral')
    # NOVA COLUNA: Define a quem pertence a tarefa
    session_id = db.Column(db.String(100), nullable=False, default='admin')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'priority': self.priority,
            'notes': self.notes,
            'completed': self.completed,
            'week_key': self.week_key,
            'completed_week_key': self.completed_week_key,
            'category': self.category,
            'session_id': self.session_id
        }

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

# Rota de Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    password = data.get('password', '')
    admin_pass = os.getenv('ADMIN_PASSWORD')
    
    if admin_pass and password == admin_pass:
        return jsonify({"status": "ok"}), 200
    return jsonify({"error": "Senha incorreta"}), 401

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    week_key = request.args.get('week')
    session_id = request.args.get('session_id', 'admin')
    
    if not week_key:
        return jsonify({"error": "O parâmetro 'week' é obrigatório"}), 400
    
    tasks = Task.query.filter(
        and_(
            Task.session_id == session_id,
            Task.week_key <= week_key,
            or_(
                Task.completed == False,
                Task.completed_week_key >= week_key
            )
        )
    ).all()
    return jsonify([task.to_dict() for task in tasks]), 200

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    new_task = Task(
        name=data.get('name'),
        priority=data.get('priority', 'medium'),
        notes=data.get('notes'),
        week_key=data.get('week_key'),
        completed_week_key=None,
        category='geral',
        completed=False,
        session_id=data.get('session_id', 'admin')
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

@app.route('/api/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = db.session.get(Task, id)
    if not task: return jsonify({"error": "Não achou"}), 404
    data = request.json
    
    task.name = data.get('name', task.name)
    task.priority = data.get('priority', task.priority)
    task.notes = data.get('notes', task.notes)
    task.completed = data.get('completed', task.completed)
    
    if 'completed_week_key' in data:
        task.completed_week_key = data.get('completed_week_key')

    db.session.commit()
    return jsonify(task.to_dict()), 200

@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = db.session.get(Task, id)
    if not task: return jsonify({"error": "Não achou"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Excluída"}), 200

# Rota para injetar dados na Sessão de Demonstração
@app.route('/api/demo/setup', methods=['POST'])
def setup_demo():
    data = request.json
    session_id = data.get('session_id')
    week_key = data.get('week_key')
    
    demo_tasks = [
        Task(name="Demonstração 1 (Urgente)", priority="high", week_key=week_key, session_id=session_id),
        Task(name="Demonstração 2 (Importante)", priority="high", week_key=week_key, session_id=session_id),
        Task(name="Demonstração 3 (Normal)", priority="medium", week_key=week_key, session_id=session_id),
        Task(name="Demonstração 4 (Normal)", priority="medium", week_key=week_key, session_id=session_id),
        Task(name="Demonstração 5 (Tranquilo)", priority="low", week_key=week_key, session_id=session_id),
        Task(name="Demonstração 6 (Tranquilo)", priority="low", week_key=week_key, session_id=session_id),
    ]
    db.session.add_all(demo_tasks)
    db.session.commit()
    return jsonify({"status": "ok"}), 201

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(port=5050, debug=True)