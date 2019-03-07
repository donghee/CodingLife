from pypozyx import (PozyxSerial, get_first_pozyx_serial_port)
from pypozyx.definitions.registers import POZYX_WHO_AM_I
from pypozyx.structures.generic import Data, SingleRegister

#from pythonosc.udp_client import SimpleU

serial_port = get_first_pozyx_serial_port()
print(serial_port)
pozyx = PozyxSerial(serial_port)

data = Data([0] * 5)
#remote_id = 0x675b
#remote_id = 0x0
#pozyx.getRead(POZYX_WHO_AM_I, data, remote_id=remote_id)
#print('who am i: 0x%0.2x' % data[0])
#print('firmware version: 0x%0.2x' % data[1])
#print('hardware version: 0x%0.2x' % data[2])
#print('self test result: %s' % bin(data[3]))
#print('error: 0x%0.2x' % data[4])

whoami = SingleRegister()
pozyx.regRead(POZYX_WHO_AM_I, whoami) # which is pozyx.getWhoAmI(whoami)
print(whoami)
