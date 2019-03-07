

## pozyx python library 1.2.6 error. 가끔 발생 

2019년 2월 10일

<code>
POS ID: 0x676e, x(mm): 1873, y(mm): -1026, z(mm): 4323 Heading: 342.375, Roll: 0.25, Pitch: -0.6875
POS ID: 0x671a, x(mm): 2737, y(mm): -1392, z(mm): 174 Heading: 346.6875, Roll: -3.5, Pitch: 0.8125
POS ID: 0x676e, x(mm): 1883, y(mm): -993, z(mm): 4334 Heading: 342.375, Roll: 0.25, Pitch: -0.6875
POS ID: 0x671a, x(mm): 2737, y(mm): -1402, z(mm): 151 Heading: 346.6875, Roll: -3.5, Pitch: 0.8125
Traceback (most recent call last):
  File "multitag_positioning.py", line 199, in <module>
    r.loop()
  File "multitag_positioning.py", line 82, in loop
    position, self.dimension, self.height, self.algorithm, remote_id=tag_id)
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/lib.py", line 1065, in doPositioning
    status = self.doPositioningWithData(position_data, remote_id=remote_id, timeout=timeout)
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/lib.py", line 1129, in doPositioningWithData
    self.getRxInfo(rx_info)
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/core.py", line 491, in getRxInfo
    return self.getRead(PozyxRegisters.RX_NETWORK_ID, rx_info, remote_id)
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/core.py", line 265, in getRead
    return self.regRead(address, data)
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/pozyx_serial.py", line 274, in regRead
    data.load_bytes(r)
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/structures/byte_structure.py", line 25, in load_bytes
    self.bytes_to_data()
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/structures/byte_structure.py", line 34, in bytes_to_data
    self.load_packed(s)
  File "/home/donghee/.local/share/virtualenvs/pozyx-multitag-broadcast-7nxcUP13/lib/python3.5/site-packages
/pypozyx/structures/byte_structure.py", line 43, in load_packed
    index:index + data_len])[0]
struct.error: unpack requires a bytes object of length 2
</code>
