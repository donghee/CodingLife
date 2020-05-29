import sys
import asyncio
import time

import qtawesome as qta

from PyQt5.QtWidgets import QApplication, QProgressBar, QPushButton, QWidget, QVBoxLayout, QHBoxLayout, QLabel
from PyQt5.QtCore import pyqtSlot, Qt, QSize
from quamash import QEventLoop, QThreadExecutor

import asyncio
from mavsdk import System

from functools import partial, wraps

try:
    unichr
except NameError:
    unichr = chr

def display_error(err):
    app = QApplication.instance()
    window = app.activeWindow()
    dialog = QErrorMessage(window)
    dialog.setWindowModality(Qt.WindowModal)
    dialog.setWindowTitle("Error")
    dialog.showMessage(err)

def slot_coroutine(async_func):
    if not asyncio.iscoroutinefunction(async_func):
        raise RuntimeError('Must be a coroutine!')

    def log_error(future):
        try:
            future.result()
        except Exception as err:
            display_error(traceback.format_exc())

    @wraps(async_func)
    def wrapper(self, *args):
        loop = asyncio.get_event_loop()
        future = loop.create_task(async_func(self, *args[:-1]))
        future.add_done_callback(log_error)
    return wrapper

app = QApplication(sys.argv)
loop = QEventLoop(app)
asyncio.set_event_loop(loop)  # NEW must set the event loop
g_flight_mode = ""
g_altitude = ""

async def arm():
    print("-- Arm")
    await drone.action.arm()

async def disarm():
    print("-- Disarm")
    await drone.action.disarm()

async def takeoff():
    print("-- Taking off")
    await drone.action.takeoff()

async def land():
    print("-- Landing")
    await drone.action.land()


async def print_battery(drone, window):
    async for battery in drone.telemetry.battery():
        print(f"Battery: {battery.remaining_percent}")
        window.update_battery(f"Battery: {round(battery.remaining_percent*100)}")


async def print_gps_info(drone,window ):
    async for gps_info in drone.telemetry.gps_info():
        print(f"GPS info: {gps_info}")
        window.update_gps_info(f"GPS info: {gps_info.num_satellites}")

async def print_flight_mode(drone, window):
    previous_flight_mode = None

    async for flight_mode in drone.telemetry.flight_mode():
        if flight_mode is not previous_flight_mode:
            previous_flight_mode = flight_mode
            g_flight_mode = f"Flight mode: {flight_mode}"
            print(g_flight_mode)
            window.set_flight_mode(g_flight_mode)

async def print_altitude(drone, window):
    """ Prints the altitude when it changes """

    previous_altitude = None

    async for position in drone.telemetry.position():
        altitude = round(position.relative_altitude_m, 1)
        if altitude != previous_altitude:
            previous_altitude = altitude
            g_altitude = f"Altitude: {altitude}"
            print(g_altitude)
            window.set_altitude(g_altitude)

async def print_is_armed(drone, window):
    async for is_armed in drone.telemetry.armed():
        if is_armed:
            window.update_arm('ARMED')
        else:
            window.update_arm('DISARMED')

drone = System()


class ArmDisarmButton(QPushButton):
    def __init__(self):
        QPushButton.__init__(self, "DISARMED")
        self.setCheckable(True)
        self.state = False
        self.toggled.connect(partial(self.on_arm_disarm))

    @slot_coroutine
    async def on_arm_disarm(self):
        if not self.state:
            await arm()
        else:
            await disarm()
        self.state = not self.state

        self.setText({True: "ARMED", False: "DISARM"}[self.state])


class TakeoffLandButton(QPushButton):
    def __init__(self):
        QPushButton.__init__(self, "Takeoff")
        self.takeoff_icon = qta.icon('mdi.airplane-takeoff', scale_factor=1.2)
        self.setIcon(self.takeoff_icon)
        self.setIconSize(QSize(24,24))
        self.land_icon = qta.icon('mdi.airplane-landing', scale_factor=1.2)
        self.setCheckable(True)
        self.state = False
        self.toggled.connect(partial(self.on_takeoff_land))

    @slot_coroutine
    async def on_takeoff_land(self):
        if not self.state:
            await takeoff()
        else:
            await land()
        self.state = not self.state
        self.setText({True: "Takeoff", False: "Land"}[self.state])
        self.setIcon({True: self.takeoff_icon, False: self.land_icon}[self.state])

async def run(window):
    await drone.connect(system_address="udp://:14540")
    print("Waiting for drone to connect...")
    async for state in drone.core.connection_state():
        if state.is_connected:
            print(f"Drone discovered with UUID: {state.uuid}")
            break

    print("Waiting for drone to have a global position estimate...")
    async for health in drone.telemetry.health():
        if health.is_global_position_ok:
            print("Global position estimate ok")
            break

    asyncio.ensure_future(print_battery(drone, window))
    asyncio.ensure_future(print_gps_info(drone, window))
    asyncio.ensure_future(print_flight_mode(drone, window))
    asyncio.ensure_future(print_altitude(drone, window))
    asyncio.ensure_future(print_is_armed(drone, window))

    #print("-- Arming")
    #await drone.action.arm()

    while True:
        await asyncio.sleep(50)

def main() -> int:
    import atexit
    import asyncio
    import datetime
    from PyQt5.QtWidgets import QApplication
    from quamash import QEventLoop

    window = Window()
    window.show()

    # Running the application
    with loop:
        loop.run_until_complete(run(window))
        #loop.run_until_complete(master())

class Window(QWidget):
    def __init__(self):
        super(Window, self).__init__()
        self.takeoffland = TakeoffLandButton()
        self.armdisarm = ArmDisarmButton()
        self.flight_mode = QLabel("Flight mode: ", self)
        self.arm = QLabel("DISARM", self)
        self.altitude = QLabel("Altitude: ", self)

        self.battery_widget = QLabel(unichr(0xf079))
        self.battery_widget.setFont(qta.font('mdi', 16))
        self.battery = QLabel("Battery: ", self)

        #self.satellite_widget = qta.IconWidget()
        #satellite_icon = qta.icon('mdi.satellite-variant', scale_factor=1.1)
        #self.satellite_widget.setIcon(satellite_icon)
        self.satellite_widget = QLabel(unichr(0xf471))
        self.satellite_widget.setFont(qta.font('mdi', 16))
        self.gps_info = QLabel("GPS info: ", self)

        layout = QVBoxLayout(self)
        layout.addWidget(self.arm)
        layout.addStretch(1)
        layout.addWidget(self.flight_mode)
        layout.addStretch(1)
        layout.addWidget(self.altitude)
        layout.addStretch(1)

        hbox = QHBoxLayout()
        hbox.addWidget(self.battery_widget)
        hbox.addWidget(self.battery)
        layout.addLayout(hbox)
        layout.addStretch(1)

        hbox = QHBoxLayout()
        hbox.addWidget(self.satellite_widget)
        hbox.addWidget(self.gps_info)
        layout.addLayout(hbox)

        layout.addWidget(self.armdisarm)
        layout.addStretch(1)
        layout.addWidget(self.takeoffland)
        layout.addStretch(1)
        #self.setGeometry(100,100,150,150)
        self.setLayout(layout)

    def set_altitude(self, altitude):
        self.altitude.setText(altitude + 'm')

    def set_flight_mode(self, flight_mode):
        self.flight_mode.setText(flight_mode)

    def update_arm(self, arm):
        self.arm.setText(arm)

    def update_battery(self, battery):
        self.battery.setText(battery + '%')

    def update_gps_info(self, gps_info):
        self.gps_info.setText(gps_info)

main()
