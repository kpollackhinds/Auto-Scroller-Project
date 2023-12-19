from flask import Flask, request, render_template, send_from_directory, Response, jsonify
from flask_socketio import SocketIO
import socket
import threading

import sys, os

sys.path.append(os.path.abspath(os.path.join('..', 'AUTONOMOUS-DRIVING-PROJECT')))
app = Flask(__name__, template_folder=  'templates', static_folder= 'static')

socketio = SocketIO(app)
HOST = "0.0.0.0"
MCU_PORT = 5000
ARDUINO_PORT = 6000

mcu_connected = False
arduino_connected = False

# global variable tracking state of buttons
current_state = {}

mcu_thread = None
mcu_socket = None
# stop_thread = threading.Event()

arduino_thread = None
arduino_socket = None
# stop_thread = threading.Event()

scroll_up = True

def send_data(data):
    if 'mcu_socket' in globals():
        try:
            mcu_socket.sendall(data.encode('utf-8'))
        except Exception as e:
            print(f'Error sending data to Pico: {e}')
    return

@socketio.on('pico_connection')
def mcu_connection_handler():
    global mcu_socket, mcu_connected
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, MCU_PORT))
        server_socket.listen()

        print(f"Waiting for MCU Client to connect on {HOST}:{MCU_PORT}")
        mcu_socket, addr = server_socket.accept()
        print(mcu_socket, addr)
        mcu_connected = True
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

def remote_arduino_handler():
    global arduino_socket, arduino_connected
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket2:
        server_socket2.bind((HOST, ARDUINO_PORT))
        server_socket2.listen()

        print(f"Waiting for Arduino Client to connect on {HOST}:{ARDUINO_PORT}")
        arduino_socket, addr2 = server_socket2.accept()
        arduino_connected = True
        socketio.emit('arduino_connected')
        print('arduino connected')
        while True:
            full_data = ''
            while True:
                data = arduino_socket.recv(1024)
                if not data:
                    break

                full_data += data.decode('utf-8')
                if full_data.endswith('\n'):
                    break
            
            full_data = full_data[:-1]

            print(mcu_connected)
            if full_data == "left":
                socketio.emit("autoscroll off")
                if mcu_connected:
                    send_data(" \n")
            elif full_data == "right":
                socketio.emit("autoscroll on")
                if mcu_connected:
                    send_data(" \n")
            
            elif mcu_connected:
                send_data(full_data + "\n")

            

            print(full_data)

@socketio.on('start_arduino_thread')
def start_arduino_thread():
    global arduino_thread
    print('starting connection to arduino')
    arduino_thread = threading.Thread(target=remote_arduino_handler)
    arduino_thread.daemon = True
    arduino_thread.start()
            
@socketio.on('start_mcu_thread')
def start_mcu_thread():
    global mcu_thread
    print('starting connection')
    # stop_thread.clear()
    mcu_thread = threading.Thread(target=mcu_connection_handler)
    mcu_thread.daemon = True
    mcu_thread.start()


# @socketio.on('reset-connection')
# def reset_connection():
#     global mcu_thread, stop_thread, mcu_socket, connected
#     print('Resetting Connection')

#     # Signal thread to stop
#     stop_thread.set()

#     # Close the socket if it's open
#     if mcu_socket:
#         mcu_socket.close()
#         mcu_socket = None
    
#     connected = False

#     # Join the thread to ensure it has fully stopped
#     if mcu_thread:
#         mcu_thread.join()
#         mcu_thread = None

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
            "dir":data.get('dir')
        }
        # message to mcu telling it to make a get request to get updated settings\
        if mcu_connected:
            send_data('mkrq\n')
        else:
            print('No device connected')

    return jsonify({'status': 'success'})


@app.route('/get_setting_states', methods=['GET'])
def get_setting_states():
    return jsonify(current_state)

 

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port= 8080, debug= True)