from flask import Flask, request, render_template, send_from_directory, Response, jsonify
from flask_socketio import SocketIO
import socket
import threading

import sys, os

sys.path.append(os.path.abspath(os.path.join('..', 'AUTONOMOUS-DRIVING-PROJECT')))
app = Flask(__name__, template_folder=  'templates', static_folder= 'static')

socketio = SocketIO(app)
HOST = "0.0.0.0"
PORT = 5000

connected = False

# global variable tracking state of buttons
current_state = {}

mcu_thread = None
mcu_socket = None
stop_thread = threading.Event()

def send_data(data):
    if 'mcu_socket' in globals():
        try:
            mcu_socket.sendall(data.encode('utf-8'))
        except Exception as e:
            print(f'Error sending data to Pico: {e}')
    return

@socketio.on('pico_connection')
def mcu_connection_handler():
    global mcu_socket, connected, stop_thread
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, PORT))
        server_socket.listen()

        print(f"Waiting for MCU Client to connect on {HOST}:{PORT}")
        mcu_socket, addr = server_socket.accept()
        connected = True
        socketio.emit('mcu_connected')
        print('mcu connected')
        while True:
            full_data = ''
            while True:
                data = mcu_socket.recv(1024)
                if not data:
                    break

                full_data += data.decode('utf-8')
                if full_data.endswith('\n'):
                    break
            
            full_data = full_data[:-1]
            print(full_data)
            
@socketio.on('start_mcu_thread')
def start_mcu_thread():
    global mcu_thread,stop_thread
    print('starting connection')
    stop_thread.clear()
    mcu_thread = threading.Thread(target=mcu_connection_handler)
    mcu_thread.daemon = True
    mcu_thread.start()

@socketio.on('reset-connection')
def reset_connection():
    global mcu_thread, stop_thread, mcu_socket, connected
    print('Resetting Connection')

    # Signal thread to stop
    stop_thread.set()

    # Close the socket if it's open
    if mcu_socket:
        mcu_socket.close()
        mcu_socket = None
    
    connected = False

    # Join the thread to ensure it has fully stopped
    if mcu_thread:
        mcu_thread.join()
        mcu_thread = None

@app.route('/')
def control_panel():
    return render_template("index.html")

@app.route('/js/index.js')
def serve_js(filename):
    return send_from_directory('static/js', filename)

@app.route('/update_setting_states', methods=['POST'])
def update_setting_states():
    global current_state
    if request.method == 'POST':
        data = request.json
        current_state = {
            "sound_state": data.get('soundState'),
            "scroll_state": data.get('scrollState'),
            "scroll_speed": data.get('scrollSpeed'),
        }
        print('y')
        # message to mcu telling it to make a get request to get updated settings
        send_data('mkrq')
        return jsonify({'status': 'success'})

@app.route('/get_setting_states', methods=['GET'])
def get_setting_states():
    return jsonify(current_state)

 

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port= 8080, debug= True)