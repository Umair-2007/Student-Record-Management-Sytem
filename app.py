from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='Templates', static_folder='Templates')
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///students.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    class_name = db.Column(db.String(50), nullable=False)
    roll = db.Column(db.String(50), unique=True, nullable=False)
    marks = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_files(path):
    return app.send_static_file(path)

@app.route('/students', methods=['GET'])
def get_students():
    try:
        students = Student.query.all()
        result = [{
            'id': student.id,
            'name': student.name,
            'class': student.class_name,
            'roll': student.roll,
            'marks': student.marks
        } for student in students]
        print(f"API Response: {result}")
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_students: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/students', methods=['POST'])
def create_student():
    data = request.get_json()
    try:
        new_student = Student(
            name=data['name'],
            class_name=data['class'],
            roll=data['roll'],
            marks=float(data['marks']) if data.get('marks') else None
        )
        db.session.add(new_student)
        db.session.commit()
        return jsonify({'message': 'Student created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/students/<int:id>', methods=['PUT'])
def update_student(id):
    student = Student.query.get_or_404(id)
    data = request.get_json()
    try:
        student.name = data.get('name', student.name)
        student.class_name = data.get('class', student.class_name)
        student.roll = data.get('roll', student.roll)
        if 'marks' in data:
            student.marks = float(data['marks']) if data['marks'] else None
        db.session.commit()
        return jsonify({'message': 'Student updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get_or_404(id)
    try:
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Student deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    # Ensure both fields are present
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    # Check for existing user
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    # Hash password before storing
    hashed_password = generate_password_hash(password)
    user = User(username=username, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Signup successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    # Check password hash
    if user and check_password_hash(user.password, password):
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid username or password'}), 401

if __name__ == '__main__':
    from waitress import serve
    app.config['DEBUG'] = False
    serve(app, host='0.0.0.0', port=5001)