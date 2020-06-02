import os
import functools
from PyQt5 import QtCore, QtGui, QtWidgets, QtWebEngineWidgets, QtWebChannel


class MapWindow(QtWidgets.QWidget):
    def __init__(self):
        super(MapWindow, self).__init__()
        self.setFixedSize(200, 200)
        vbox = QtWidgets.QVBoxLayout()
        self.setLayout(vbox)

        label = self.label = QtWidgets.QLabel()
        sp = QtWidgets.QSizePolicy()
        sp.setVerticalStretch(0)
        label.setSizePolicy(sp)
        vbox.addWidget(label)
        view = self.view = QtWebEngineWidgets.QWebEngineView()
        channel = self.channel = QtWebChannel.QWebChannel()

        channel.registerObject("MapWindow", self)
        view.page().setWebChannel(channel)

        file = os.path.join(
            os.path.dirname(os.path.realpath(__file__)),
            "map.html",
        )
        self.view.setUrl(QtCore.QUrl.fromLocalFile(file))
        vbox.addWidget(view)

        self.panMap(47.397742, 8.545594)

    @QtCore.pyqtSlot(float, float)
    def onMapMove(self, lat, lng):
        print("Lat: {:.5f}, Lng: {:.5f}".format(lat, lng))
        self.label.setText("Center Lat: {:.4f}, Lng: {:.4f}".format(lat, lng))
        self.center_lng = lng
        self.center_lat = lat

    def panMap(self, lat, lng):
        page = self.view.page()
        page.runJavaScript("map.panTo(L.latLng({}, {}));".format(lat, lng))

    def getCenterLanLat(self):
        return {'latitude': self.center_lat, 'longitude': self.center_lng}


if __name__ == "__main__":
    import sys
    app = QtWidgets.QApplication(sys.argv)
    window = MapWindow()
    window.show()
    sys.exit(app.exec_())
