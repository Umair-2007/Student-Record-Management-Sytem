from flask import Flask, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_dance.contrib.google import make_google_blueprint, google
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
import traceback
import os

app = Flask(__name__, template_folder='Templates', static_folder='Templates')
app.secret_key = os.urandom(24) # Add a secret key for session
# Configure session to be more secure and work with HTTPS
# For development with self-signed certificates, we need to be more permissive
app.config['SESSION_COOKIE_SECURE'] = False  # Allow cookies over HTTP for development
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to session cookie
app.config['SESSION_COOKIE_SAMESITE'] = None  # Allow cross-site cookies for OAuth
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # Session timeout in seconds (1 hour)

# Make sessions permanent by default
@app.before_request
def make_session_permanent():
    session.permanent = True

# Configure CORS to allow credentials
CORS(app, resources={r"/*": {"origins": ["https://localhost:5001", "http://localhost:5001"]}}, supports_credentials=True)

# Google OAuth setup
google_bp = make_google_blueprint(
    client_id="637068626535-6vdrvps0199thj8c9ucscmlu7pg0vb58.apps.googleusercontent.com",
    client_secret="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",
    scope=["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email", "openid"],
)
app.register_blueprint(google_bp, url_prefix="/auth")

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
    email = db.Column(db.String(120), unique=True, nullable=False)
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
    email = data.get('email')
    password = data.get('password')
    # Ensure all fields are present
    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password required'}), 400
    # Check for existing user
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    # Hash password before storing
    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Signup successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        session['username'] = user.username  # Store username in session
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/profile', methods=['GET'])
def profile():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'Not logged in'}), 401
        
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({
        'username': user.username,
        'email': user.email,
        'role': 'Admin'
    })

@app.route('/delete_account', methods=['DELETE'])
def delete_account():
    username = session.get('username')
    if not username:
        print("Delete account error: Not logged in")
        return jsonify({'error': 'Not logged in'}), 401
    user = User.query.filter_by(username=username).first()
    if not user:
        print("Delete account error: User not found")
        return jsonify({'error': 'User not found'}), 404
    try:
        db.session.delete(user)
        db.session.commit()
        session.pop('username', None)
        print(f"User {username} deleted successfully.")
        return jsonify({'message': 'Account deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Delete account error: {type(e).__name__}: {e}")  # More detailed error
        return jsonify({'error': 'Server error: ' + str(e)}), 500

@app.route('/auth/google')
def auth_google():
    if not google.authorized:
        return redirect(url_for('google.login'))
    return redirect('/index.html')

@app.route('/auth/google/authorized')
def google_authorized():
    if not google.authorized:
        return redirect(url_for('google.login'))
    try:
        resp = google.get('/oauth2/v2/userinfo')
        if not resp.ok:
            return jsonify({'error': 'Failed to get user info from Google'}), 401
        
        user_info = resp.json()
        email = user_info.get('email')
        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            username = email.split('@')[0]
            # Ensure username is unique
            while User.query.filter_by(username=username).first():
                username = f"{email.split('@')[0]}{os.urandom(2).hex()}"

            password = os.urandom(16).hex()
            hashed_password = generate_password_hash(password)
            user = User(username=username, email=email, password=hashed_password)
            db.session.add(user)
            db.session.commit()

        session.clear()
        session['username'] = user.username
        return redirect('/index.html')

    except Exception as e:
        print(f"Exception in google_authorized: {str(e)}")
        return jsonify({'error': f'Error during Google authentication: {str(e)}'}), 500

@app.errorhandler(400)
@app.errorhandler(401)
@app.errorhandler(404)
@app.errorhandler(500)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = error.code if hasattr(error, 'code') else 500
    return response

@app.errorhandler(Exception)
def handle_unexpected_error(error):
    print("Unexpected error:", error)
    print(traceback.format_exc())
    # If the error is an HTTPException, use its code
    code = getattr(error, 'code', 500)
    return jsonify({'error': str(error)}), code

# No code change needed, but follow these steps:
# 1. Stop your server.
# 2. Delete the file: /Users/umairwanware/Documents/Student Record Management Sytem/students.db
# 3. Start your server again. The database will be recreated with the correct columns.

if __name__ == '__main__':
    # Check if certificate files exist
    cert_path = 'cert.pem'
    key_path = 'key.pem'
    
    if os.path.exists(cert_path) and os.path.exists(key_path):
        # Run with HTTPS
        print("Starting server with HTTPS on port 5001")
        app.run(debug=True, port=5001, ssl_context=(cert_path, key_path))
    else:
        # Fallback to HTTP
        print("Certificate files not found. Starting server with HTTP on port 5001")
        app.run(debug=True, port=5001)