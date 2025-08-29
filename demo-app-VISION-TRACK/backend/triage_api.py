"""
TRIAGE A.I. Flask API Server
RESTful API endpoints for medical triage and healthcare resource management
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import asyncio
import json
import logging
import os
from datetime import datetime
import uuid
from typing import Dict, Any

# Import our triage service
try:
    from triage_service import process_triage_request, TriageAIService
except ImportError:
    # Fallback for development
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from triage_service import process_triage_request, TriageAIService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'triage-ai-secret-key-2025')

# Enable CORS for frontend integration
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'])

# Initialize SocketIO for real-time communication
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize triage service
triage_service = TriageAIService()

# In-memory session storage (in production, use Redis or database)
active_sessions = {}

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'TRIAGE A.I. API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/triage', methods=['POST'])
def triage_endpoint():
    """Main triage endpoint for symptom analysis"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if 'text_input' not in data or not data['text_input'].strip():
            return jsonify({'error': 'Text input is required'}), 400
        
        # Generate session ID if not provided
        if 'session_id' not in data:
            data['session_id'] = str(uuid.uuid4())
        
        # Generate user ID if not provided
        if 'user_id' not in data:
            data['user_id'] = f"user_{uuid.uuid4().hex[:8]}"
        
        # Store session
        active_sessions[data['session_id']] = {
            'user_id': data['user_id'],
            'created_at': datetime.now().isoformat(),
            'last_activity': datetime.now().isoformat()
        }
        
        logger.info(f"Processing triage request for session {data['session_id']}")
        
        # Process triage request asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(process_triage_request(data))
            loop.close()
            
            # Update session activity
            if data['session_id'] in active_sessions:
                active_sessions[data['session_id']]['last_activity'] = datetime.now().isoformat()
            
            return jsonify(result)
            
        except Exception as e:
            loop.close()
            logger.error(f"Error processing triage request: {e}")
            return jsonify({
                'error': 'Internal server error',
                'status': 'error'
            }), 500
            
    except Exception as e:
        logger.error(f"Error in triage endpoint: {e}")
        return jsonify({
            'error': 'Invalid request format',
            'status': 'error'
        }), 400

@app.route('/api/resources', methods=['GET'])
def resources_endpoint():
    """Get healthcare resources based on location and triage level"""
    try:
        # Get query parameters
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        triage_level = request.args.get('level', 'routine')
        max_distance = request.args.get('distance', 50.0, type=float)
        
        if not lat or not lng:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        location = {'lat': lat, 'lng': lng}
        
        # Find healthcare resources
        try:
            resources = triage_service.find_healthcare_resources(
                location, 
                triage_level, 
                max_distance
            )
        except Exception as service_error:
            logger.error(f"Error in triage service: {service_error}")
            return jsonify({
                'error': 'Service temporarily unavailable',
                'status': 'error'
            }), 503
        
        return jsonify({
            'status': 'success',
            'resources': [resource.__dict__ for resource in resources],
            'count': len(resources),
            'location': location,
            'triage_level': triage_level
        })
        
    except Exception as e:
        logger.error(f"Error in resources endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id: str):
    """Get session information"""
    try:
        if session_id not in active_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = active_sessions[session_id]
        return jsonify({
            'status': 'success',
            'session': session
        })
        
    except Exception as e:
        logger.error(f"Error getting session: {e}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id: str):
    """Delete a session"""
    try:
        if session_id in active_sessions:
            del active_sessions[session_id]
            return jsonify({
                'status': 'success',
                'message': 'Session deleted'
            })
        else:
            return jsonify({'error': 'Session not found'}), 404
            
    except Exception as e:
        logger.error(f"Error deleting session: {e}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/healthcare-data', methods=['POST'])
def update_healthcare_data():
    """Update healthcare resources database (admin endpoint)"""
    try:
        # This would require authentication in production
        data = request.get_json()
        
        if not data or 'resources' not in data:
            return jsonify({'error': 'Resources data required'}), 400
        
        # Update database with new resources
        # This is a simplified version - in production, you'd want proper validation
        logger.info(f"Updating healthcare data with {len(data['resources'])} resources")
        
        return jsonify({
            'status': 'success',
            'message': f"Updated {len(data['resources'])} healthcare resources",
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error updating healthcare data: {e}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

@app.route('/api/analytics', methods=['GET'])
def analytics_endpoint():
    """Get system analytics and usage statistics"""
    try:
        # Calculate basic analytics
        total_sessions = len(active_sessions)
        active_sessions_count = sum(
            1 for session in active_sessions.values()
            if (datetime.now() - datetime.fromisoformat(session['last_activity'])).seconds < 3600
        )
        
        return jsonify({
            'status': 'success',
            'analytics': {
                'total_sessions': total_sessions,
                'active_sessions': active_sessions_count,
                'uptime': 'running',
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error in analytics endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500

# WebSocket events for real-time communication
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to TRIAGE A.I. API'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")
    # Clean up any active sessions for this client

@socketio.on('join_session')
def handle_join_session(data):
    """Join a triage session room"""
    try:
        session_id = data.get('session_id')
        if session_id:
            join_room(session_id)
            emit('joined_session', {'session_id': session_id, 'message': 'Joined session'})
    except Exception as e:
        logger.error(f"Error joining session: {e}")
        emit('error', {'message': 'Failed to join session'})

@socketio.on('leave_session')
def handle_leave_session(data):
    """Leave a triage session room"""
    try:
        session_id = data.get('session_id')
        if session_id:
            leave_room(session_id)
            emit('left_session', {'session_id': session_id, 'message': 'Left session'})
    except Exception as e:
        logger.error(f"Error leaving session: {e}")
        emit('error', {'message': 'Failed to leave session'})

@socketio.on('triage_update')
def handle_triage_update(data):
    """Handle real-time triage updates"""
    try:
        session_id = data.get('session_id')
        if session_id:
            # Broadcast update to all clients in the session
            emit('triage_result', data, room=session_id)
    except Exception as e:
        logger.error(f"Error handling triage update: {e}")
        emit('error', {'message': 'Failed to process triage update'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'status': 'error'
    }), 500

# Cleanup function for expired sessions
def cleanup_expired_sessions():
    """Remove sessions that have been inactive for more than 24 hours"""
    try:
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session_data in active_sessions.items():
            try:
                last_activity = datetime.fromisoformat(session_data['last_activity'])
                if (current_time - last_activity).days >= 1:
                    expired_sessions.append(session_id)
            except (ValueError, KeyError) as parse_error:
                logger.warning(f"Invalid session data for {session_id}: {parse_error}")
                # Mark invalid sessions for cleanup
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            try:
                del active_sessions[session_id]
                logger.info(f"Cleaned up expired session: {session_id}")
            except KeyError:
                # Session already removed
                pass
            
    except Exception as e:
        logger.error(f"Error cleaning up expired sessions: {e}")

# Scheduled cleanup (in production, use Celery or similar)
@app.before_request
def before_request():
    """Clean up expired sessions before each request"""
    cleanup_expired_sessions()

# Development server configuration
if __name__ == '__main__':
    # Load environment variables
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting TRIAGE A.I. API server on port {port}")
    
    if debug:
        # Development server
        app.run(host='0.0.0.0', port=port, debug=True)
    else:
        # Production server with SocketIO
        socketio.run(app, host='0.0.0.0', port=port, debug=False)
