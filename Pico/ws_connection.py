from time import sleep
import network
import usocket as socket

def connectWifi(ssid, pw, wlan):
    wlan.active(True)
    wlan.disconnect()
    wlan.connect(ssid, pw)
    while wlan.isconnected() == False:
        print(ssid, pw)
        print('Waiting for connection...')
        sleep(1)

    ip = wlan.ifconfig()[0]
    print(f'connected on {ip}')
    return ip


def connect_to_socket(ssid, pw, wlan, ip, port):
    while True:
        try:
            connectWifi(ssid, pw, wlan)

            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_addr = (ip, port)
            sock.connect(server_addr)

            return sock
        
        except OSError as e:
            print("Socket error: ", e)
            wlan.disconnect()
            wlan.active(False)
            sleep(5)