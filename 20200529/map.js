var map;

function initialize(){
    map = L.map('map').setView([47.397742, 8.545594], 16);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);

    var droneIcon = L.icon({
    iconUrl: 'drone.png',
    iconSize:     [32, 32], // size of the icon
    iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor:  [16, 16] // point from which the popup should open relative to the iconAnchor
});
    var marker = L.marker(map.getCenter(), {icon: droneIcon}).addTo(map);

    new QWebChannel(qt.webChannelTransport, function (channel) {
        window.MapWindow = channel.objects.MapWindow;
        if(typeof MapWindow != 'undefined') {
            var onMapMove = function() { MapWindow.onMapMove(map.getCenter().lat, map.getCenter().lng) };
            map.on('move', onMapMove);
            onMapMove();
        }
    });
}
