var fs = require('fs');
var BLEDevice = require('./bledevice.js');
var profile = JSON.parse(fs.readFileSync('./profiles/sensortag.json'));

var ble = new BLEDevice();
ble.loadProfile(profile);

ble.on(BLEDevice.deviceConnectedEvent, onConnect);
ble.on(BLEDevice.deviceFoundEvent, onDevice);
ble.on(BLEDevice.dataEvent, onData);
ble.connect("SensorTag", profile);


function onConnect() {
    console.log("Device Connected");
    ble.observe(true, "magnetometer");
}

function onDevice(name) {
    console.log(name + " found")
}

function onData(service, characteristic, data) {
    console.log(service + " - " + characteristic);
    console.log(data)
}
