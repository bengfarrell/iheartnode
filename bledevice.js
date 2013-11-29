var noble = require('noble');
var events = require('events');
var util = require('util');
var Service = require('./service');
var Interpreter_SensorTag = require('./interpreters/sensortag');

BLEDevice = function() {
    var self = this;

    /** characteristics to watch for */
    this._characteristics = {};

    /** should we connect to device? */
    this._shouldConnect = false;

    /**
     * connect to named peripheral
     * @param nameOfPeripheral
     * @param connection profile
     */
    this.connect = function(nameOfPeripheral, profile) {
        this._shouldConnect = true;
        this.loadProfile(profile);
        this.find(nameOfPeripheral);
    }

    /**
     * find a specific peripheral
     * @param nameOfPeripheral
     */
    this.find = function(nameOfPeripheral) {
        this._searchFor = nameOfPeripheral;
        this.scan();
    }

    /**
     * scan for peripherals
     */
    this.scan = function() {
        noble.on('ble', self._onPeripheralFound);
        noble.startScanning();
    }

    /**
     * stop scanning
     */
    this.stopScan = function() {
        noble.removeListener('ble', self._onPeripheralFound);
        noble.stopScanning();
    }

    /**
     * load JSON profile
     * @param profile JSON
     */
    this.loadProfile = function(profile) {
        this._profile = profile;
    }

    /**
     * listen to data from a given service and characteristic
     * @param boolean to indicate to listen or not listen
     * @param serviceName
     * @param poll frequency
     */
    this.observe = function(active, serviceName, pollFrequency) {
        if (!this._profile) {
            throw new Error("No profile loaded");
        }

        if (!pollFrequency) {
            pollFrequency = 750;
        }

        var service;

        // create a service object
        for (var svc in this._profile.services) {
            if (serviceName == svc) {
                service = new Service(self._characteristics, this._profile.services[svc]);
            }
        }

        if (service) {
            if (service.getProfile().polling && service.getProfile().polling === true) {
                service.getCharacteristicByName('config').write(new Buffer([ parseInt(service.getProfile().enableCommand) ]), false, function() {
                    setInterval( function() {
                        service.getCharacteristicByName('data').read( function(error, data) {
                            self.emit(BLEDevice.dataEvent,
                                service.getProfile().name,
                                "data",
                                self._interpretData(self._profile.name, service.getProfile().id, data));
                        });
                    }, pollFrequency);
                });
            } else {
                self._activateListener(active, service);
            }
        } else {
            throw new Error("Cannot find service/characteristic to observe")
        }
    }

    /**
     * on peripheral found callback
     * @param peripheral
     * @private
     */
    this._onPeripheralFound = function(peripheral) {
        if (peripheral.advertisement.localName === self._searchFor) {
            noble.removeListener('ble', self._onPeripheralFound);
            noble.stopScanning();
            self.emit('deviceFound', peripheral.advertisement.localName, peripheral);

            if (self._shouldConnect) {
                peripheral.connect(function(err) {
                    peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
                        self._characteristics = characteristics;
                        self.emit('deviceConnected', services, characteristics);
                    });
                });
            }
        }

        // just scanning - not necessarily looking for anything
        if (!self._searchFor) {
            self.emit('deviceFound', peripheral.advertisement.localName, peripheral);
        }
    }

    /**
     * interpret data to a JSON object if possible
     * @param service
     * @param characteristic
     * @param data
     * @private
     */
    this._interpretData = function(peripheral, service, data) {
        switch (peripheral) {
            case "SensorTag":
                return Interpreter_SensorTag.interpret(service, data);
                break;
        }
    }

    this._activateListener = function(active, service) {
        service.getCharacteristicByName('data').notify(active, function(state) {
            if (active) {
                service.getCharacteristicByName('data').addListener('read', function(data) {
                    self.emit(BLEDevice.dataEvent,
                        service.getProfile().name,
                        "data",
                        self._interpretData(self._profile.name, service.getProfile().name, 'data', data));
                });
            } else {
                service.getCharacteristicByName('data').removeListener('read', listener);
            }
        });
    }
}

util.inherits(BLEDevice, events.EventEmitter);


BLEDevice.deviceFoundEvent = "deviceFound";
BLEDevice.deviceConnectedEvent = "deviceConnected";
BLEDevice.dataEvent = "dataEvent";

module.exports = BLEDevice;
