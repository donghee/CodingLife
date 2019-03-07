#from pypozyx import PozyxSerial
#port = '/dev/tty/ACM0'
#p = PozyxSerial(port)

import paho.mqtt.client as mqtt

mqttc = mqtt.Client()

mqttc.connect("localhost")
mqttc.loop_start()

import time

i = '[{"version":"1","alive":true,"tagId":"26394","success":true,"timestamp":1547554808.462,"data":{"tagData":{},"anchorData":[],"coordinates":{"x":2041,"y":-1364,"z":3310},"orientation":{"yaw":4.258,"roll":0.249,"pitch":0.012},"metrics":{"latency":67.8,"rates":{"update":8.335,"success":8.335}}}}]'

import json
j = json.loads(i)

#print(j)
#print(json.dumps(j))

while True:
    mqttc.publish("tags", json.dumps(j))
    time.sleep(1)
