import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# --- 1. CONFIGURAÇÃO INICIAL ---

app = Flask(__name__)

# Permite que o seu frontend (de outro domínio) acesse esta API
CORS(app) 

# Pega a URL do banco de dados do Render
# Isso é o MAIS IMPORTANTE para a conexão no Render
db_url = os.environ.get('DATABASE_URL') 

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
db = SQLAlchemy(app)

# --- 2. MODELO DO BANCO DE DADOS ---
# (Define como a tabela "task" será)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    priority = db.Column(db.String(50), nullable=False, default='medium')
    notes = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    week_key = db.Column(db.String(20), nullable=False) # Ex: "2025-W47"

    # Converte o objeto Task para um dicionário (para virar JSON)
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'priority': self.priority,
            'notes': self.notes,
            'completed': self.completed,
            'week_key': self.week_key
        }

# --- 3. ENDPOINTS DA API ---
# (As URLs que o seu frontend vai chamar)

# Rota para o UptimeRobot (Keep-Alive)
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

# [GET] Buscar tarefas por semana
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    # Pega o parâmetro da URL (ex: /api/tasks?week=2025-W47)
    week_key = request.args.get('week')
    if not week_key:
        return jsonify({"error": "Parâmetro 'week' é obrigatório"}), 400
    
    tasks = Task.query.filter_by(week_key=week_key).all()
    # Converte cada objeto Task para dicionário
    return jsonify([task.to_dict() for task in tasks]), 200

# [POST] Criar uma nova tarefa
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    
    new_task = Task(
        name=data.get('name'),
        priority=data.get('priority', 'medium'),
        notes=data.get('notes'),
        week_key=data.get('week_key'),
        completed=False
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(new_task.to_dict()), 201 # 201 = Criado

# [PUT] Atualizar uma tarefa (editar, completar)
@app.route('/api/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = db.session.get(Task, id)
    if not task:
        return jsonify({"error": "Tarefa não encontrada"}), 404
        
    data = request.json
    
    task.name = data.get('name', task.name)
    task.priority = data.get('priority', task.priority)
    task.notes = data.get('notes', task.notes)
    task.completed = data.get('completed', task.completed)
    # Não permitimos mudar a week_key aqui, seria uma "movimentação"
    
    db.session.commit()
    return jsonify(task.to_dict()), 200

# [DELETE] Excluir uma tarefa
@app.route('/api/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = db.session.get(Task, id)
    if not task:
        return jsonify({"error": "Tarefa não encontrada"}), 404
        
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({"message": "Tarefa excluída"}), 200

# --- 4. INICIALIZAÇÃO ---
# (Cria as tabelas no banco de dados se elas não existirem)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)