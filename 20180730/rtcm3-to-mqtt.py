#!/usr/bin/env python

import sys
import os
import socket

TCP_IP = '0.0.0.0'
TCP_PORT = 10007
BUFFER_SIZE = 512 # Normally 1024, but we want fast response

from bitstring import ConstBitStream, BitArray, ReadError, BitStream
import binascii

RTCMv3_PREAMBLE = 'd3'
UBX_PREAMBLE = 'b5'

from pymavlink.dialects.v20 import ardupilotmega as mavlink2
from pymavlink.dialects.v10 import ardupilotmega as mavlink1

class fifo(object):
    def __init__(self):
        self.buf = []
    def write(self, data):
        self.buf += data
        return len(data)
    def read(self):
        return self.buf.pop(0)

f = fifo()
mav = mavlink1.MAVLink(f)
mav.srcSystem = 0xff
mav.srcComponent = 0x00

from pymavlink import mavutil

import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish

dronemap_mqtt_server = "silverywave.com"

mqttc = mqtt.Client()
mqttc.username_pw_set("dronemap", "dronemap")
mqttc.connect(dronemap_mqtt_server, 1883, 60)
mqttc.loop_start()

# https://github.com/mavlink/qgroundcontrol/blob/master/src/GPS/RTCM/RTCMMavlink.cc
rtcm_seq = 0
mav_seq =0
svin_valid = 0

def send_rtcm_data(rtcm_len, rtcm_data):
    global rtcm_seq, mav_seq
    msg_rtcm = BitStream(rtcm_data)
    # TODO: fix. handle fragment packets
    if rtcm_len * 8 > 180*8:
        return
    msg_rtcm_padding = BitStream(length=180*8-rtcm_len*8)
    msg_rtcm.append(msg_rtcm_padding)
    #print '----'
    #print len(msg_rtcm)
    x = [ord(m) for m in msg_rtcm.bytes]
    ##print x
    #print '----'
    if(rtcm_seq << 3) > 255:
        rtcm_seq = 0

    flag = rtcm_seq << 3
    msg = mav.gps_rtcm_data_encode(flag, rtcm_len, x)
    rtcm_seq =rtcm_seq +1
    if(mav_seq > 255):
        mav_seq = 0
    mav.seq = mav_seq
    msg.pack(mav)
    mav_seq = mav_seq +1
    #print msg.get_srcSystem()
    #print msg.get_srcComponent()
    #print ''.join('{:02x}'.format(x) for x in msg.get_msgbuf())
    dronemap_topic_rx = "dronemap-doojin-rx"
    mqttc.publish(dronemap_topic_rx, msg.get_msgbuf(), qos=0)

# https://github.com/swift-nav/libswiftnav/blob/master/src/rtcm3.c
def parse_line(data):
    global svin_valid 
    packet_stream = ConstBitStream(bytes = data, length = len(data) * 8)
    #print 'all packet', packet_stream.hex
    try:
        while True:
            c = packet_stream.read(8)

            if c.hex == UBX_PREAMBLE:
                ubx_sync2 = packet_stream.read(8)
                class_id = packet_stream.read(16)
                ubx_payload_length = packet_stream.read(8)
                packet_stream.read(8).uint # 00 
                ubx_payload = packet_stream.read(ubx_payload_length.uint * 8)
                ubx_crc = packet_stream.read(16)

                ubx_bitstream = BitStream()
                # sync
                ubx_bitstream.append(c)
                ubx_bitstream.append(ubx_sync2)
                # class and id
                ubx_bitstream.append(class_id)
                # length
                ubx_bitstream.append(ubx_payload_length)
                ubx_bitstream.append(0)
                # payload
                ubx_bitstream.append(ubx_payload)
                # checksum
                ubx_bitstream.append(ubx_crc)

                if class_id.uint == (0x01 << 8 | 0x3B) and svin_valid == 0:
                    print "UBX_MSG_NAV_SVIN"
                    # version
                    ubx_payload.read(8).uint
                    # ... 
                    ubx_payload.read(3*8).uint
                    # iTOW
                    ubx_payload.read(32).uint
                    # dur
                    #dur = ubx_payload.read(32).uint
                    tmp_bitstream = BitStream()
                    dur_1 = ubx_payload.read(8)
                    dur_2 = ubx_payload.read(8)
                    dur_3 = ubx_payload.read(8)
                    dur_4 = ubx_payload.read(8)
                    tmp_bitstream = BitStream()
                    tmp_bitstream.append(dur_4)
                    tmp_bitstream.append(dur_3)
                    tmp_bitstream.append(dur_2)
                    tmp_bitstream.append(dur_1)
                    dur = tmp_bitstream.uint

                    print "NAV-SVIN dur: ", dur
                    ubx_payload.read(3*32+4*8)
                    #meanAcc = ubx_payload.read(32).uint
                    meanAcc_1 = ubx_payload.read(8)
                    meanAcc_2 = ubx_payload.read(8)
                    meanAcc_3 = ubx_payload.read(8)
                    meanAcc_4 = ubx_payload.read(8)
                    tmp_bitstream = BitStream()
                    tmp_bitstream.append(meanAcc_4)
                    tmp_bitstream.append(meanAcc_3)
                    tmp_bitstream.append(meanAcc_2)
                    tmp_bitstream.append(meanAcc_1)
                    meanAcc = tmp_bitstream.uint
                    print "NAV-SVIN meanAcc: ", meanAcc / 10000.0
                    obs = ubx_payload.read(32).uint
                    #print "NAV-SVIN obs: ", obs
                    svin_valid = ubx_payload.read(8).uint
                    print "NAV-SVIN valid: ", svin_valid
                    active = ubx_payload.read(8).uint
                    print "NAV-SVIN active: ", active

                #print 'UBX: ', class_id.hex
                #print 'UBX: ', ubx_bitstream.hex
                continue

            if c.hex != RTCMv3_PREAMBLE:
                continue

            #print 'RTCM V3'
            #print c.hex  == RTCMv3_PREAMBLE
            #print 'preamble ', c.hex
            ver = packet_stream.read(6)
            #print 'ver ', ver.uint
            if ver.uint != 0:
                continue

            payload_length = packet_stream.read(10)
            #print 'payload_length ', payload_length.uint
            payload = packet_stream.read(payload_length.uint * 8)
            #print 'payload ', payload.hex
            crc = packet_stream.read(24)
            #print 'crc', crc.hex

            _payload = BitStream()
            _payload.append(c)
            _payload.append(ver)
            _payload.append(payload_length)
            _payload.append(payload)
            _payload.append(crc)

            if svin_valid == 1:
                print 'RTCM V3: ', _payload.hex
                send_rtcm_data(payload_length.uint+6, _payload)

    except ReadError:
        #print 'Read Error'
        pass

def main(conn): 
    while True:
        data = conn.recv(BUFFER_SIZE)
        if not data: continue
        parse_line(data)

if __name__ == '__main__':
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind((TCP_IP, TCP_PORT))
    s.listen(1)

    conn, addr = s.accept()
    print 'Connection address:', addr

    try:
        main(conn)

    except KeyboardInterrupt:
        print 'Interrupted'
        conn.close()
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
