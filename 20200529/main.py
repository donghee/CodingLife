#!/usr/bin/env python

filename = __file__
#import pdb;pdb.set_trace()


from PyQt5.QtCore import pyqtSlot, Qt, QSize
from PyQt5.QtWidgets import QApplication, QProgressBar, QPushButton, QWidget, QVBoxLayout, QHBoxLayout, QLabel
from functools import partial, wraps
from map import MapWindow
from mavsdk import System
from quamash import QEventLoop, QThreadExecutor
import asyncio
import qtawesome as qta
import signal
import sys
import time

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
app.setQuitOnLastWindowClosed(False)
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


async def goto_location(latitude_deg, longitude_deg, absolute_altitude_m, yaw_deg):
    print("-- Go to location")
    await drone.action.goto_location(latitude_deg, longitude_deg, absolute_altitude_m, yaw_deg)


async def print_health(drone, window):
    async for health in drone.telemetry.health():
        print(f"health: {health}")


async def print_battery(drone, window):
    async for battery in drone.telemetry.battery():
        # print(f"Battery: {battery.remaining_percent}")
        window.update_battery(f"Battery: {round(battery.remaining_percent*100)}")


async def print_gps_info(drone, window):
    async for gps_info in drone.telemetry.gps_info():
        # print(f"GPS info: {gps_info}")
        window.update_gps_info(f"GPS info: {gps_info.num_satellites}, {gps_info.fix_type}")


async def print_position(drone, window):
    async for position in drone.telemetry.position():
        print(f"Position: {position}")
        window.update_position(f"Pos: {round(position.latitude_deg,2)}, {round(position.longitude_deg,2)}")


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
        self.setIconSize(QSize(24, 24))
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
        self.setIcon({True: self.takeoff_icon,
                      False: self.land_icon}[self.state])


class GotoLocationButton(QPushButton):
    def __init__(self, map):
        QPushButton.__init__(self, "Go")
        self.clicked.connect(partial(self.on_goto_location))
        self.map = map

    @slot_coroutine
    async def on_goto_location(self):
        print("clicked -- ")
        latitude = self.map.getCenterLanLat()['latitude']
        longitude = self.map.getCenterLanLat()['longitude']
        absolute_altitude = 491
        heading = 360
        await goto_location(latitude, longitude, absolute_altitude, heading)


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

    info = await drone.info.get_version()
    print(info)

    # asyncio.ensure_future(print_battery(drone, window))
    # asyncio.ensure_future(print_health(drone, window))
    # asyncio.ensure_future(print_gps_info(drone, window))
    # asyncio.ensure_future(print_position(drone, window))
    # asyncio.ensure_future(print_flight_mode(drone, window))
    # asyncio.ensure_future(print_altitude(drone, window))
    # asyncio.ensure_future(print_is_armed(drone, window))

    while True:
        await asyncio.sleep(1)

    # with QThreadExecutor(1) as executor:
    #     await loop.run_in_executor(executor, print_battery, drone, window)
    #     await loop.run_in_executor(executor, print_health, drone, window)
    #     await loop.run_in_executor(executor, print_gps_info, drone, window)
    #     await loop.run_in_executor(executor, print_position, drone, window)
    #     await loop.run_in_executor(executor, print_flight_mode, drone, window)
    #     await loop.run_in_executor(executor, print_altitude, drone, window)
    #     await loop.run_in_executor(executor, print_is_armed, drone, window)

    # while True:
    #     await asyncio.sleep(1)


def main() -> int:
    window = Window()
    window.show()

    try:
        with loop:
            loop.run_until_complete(run(window))
    except KeyboardInterrupt:
        pass
    finally:
        loop.close()
        sys.exit(app.exec_())


class Window(QWidget):
    def __init__(self):
        super(Window, self).__init__()
        map_window = MapWindow()

        self.takeoffland = TakeoffLandButton()
        self.armdisarm = ArmDisarmButton()
        self.goto = GotoLocationButton(map_window)
        self.flight_mode = QLabel("Flight mode: ", self)
        self.arm = QLabel("DISARM", self)
        self.altitude = QLabel("Altitude: ", self)

        self.battery_widget = QLabel(unichr(0xf079))
        self.battery_widget.setFont(qta.font('mdi', 16))
        self.battery = QLabel("Battery: ", self)

        # self.satellite_widget = qta.IconWidget()
        # satellite_icon = qta.icon('mdi.satellite-variant', scale_factor=1.1)
        # self.satellite_widget.setIcon(satellite_icon)
        self.satellite_widget = QLabel(unichr(0xf471))
        self.satellite_widget.setFont(qta.font('mdi', 16))
        self.gps_info = QLabel("GPS info: ", self)
        self.position_widget = QLabel("Pos: ", self)

        layout = QVBoxLayout(self)
        layout.addWidget(map_window)
        layout.addStretch(1)
        layout.addWidget(self.position_widget)
        layout.addStretch(1)
        layout.addWidget(self.goto)
        layout.addStretch(1)

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
        # self.setGeometry(100,100,150,150)
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

    def update_position(self, position):
        self.position_widget.setText(position)

    def closeEvent(self, event):
        # stopping the event loop
        loop.close()
        sys.exit(app.exec_())


signal.signal(signal.SIGTERM, lambda _, __: sys.exit(0))

main()
