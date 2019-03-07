#from pypozyx import PozyxSerial
#port = '/dev/tty/ACM0'
#p = PozyxSerial(port)

import paho.mqtt.subscribe as subscribe

def on_message_print(client, userdata, message):
    print("%s %s" % (message.topic, message.payload))

subscribe.callback(on_message_print, "tags", hostname="localhost")
