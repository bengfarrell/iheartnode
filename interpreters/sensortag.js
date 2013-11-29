/**
 * Please note that the majority of this logic is plucked from the SensorTag
 * project from Sandeep Mistry (https://github.com/sandeepmistry/node-sensortag)
 */
SensorTag = {};

/**
 * interpret data
 * @param characteristic
 * @param rawdata
 * @returns {*}
 */
SensorTag.interpret = function(service, rawdata) {
    switch (service) {
        case "simplekey":
            return SensorTag.interpretSimpleKey(rawdata);

        case "gyroscope":
            return SensorTag.interpretGyroscope(rawdata);

        case "irtemperature":
            return SensorTag.interpretIRTemperature(rawdata);

        case "accelerometer":
            return SensorTag.interpretAccelerometer(rawdata);

        case "humidity":
            return SensorTag.interpretHumidity(rawdata);

        case "magnetometer":
            return SensorTag.interpretMagnetometer(rawdata);

        // todo: implement barometric pressure someday, I don't really see needing it now, and the setup is more complicated
        // see Node-SensorTag for details
        /*case "barometricpressure":
            return SensorTag.interpretBarometricPressure(rawdata);*/

        default:
            return { data: rawdata };
    }
}

/**
 * interpret simple key
 * @param rawdata
 * @returns {{leftKey: boolean, rightKey: boolean}}
 */
SensorTag.interpretSimpleKey = function(rawdata) {
    var b = rawdata.readUInt8(0);
    var left = (b & 0x2) ? true : false;
    var right = (b & 0x1) ? true : false;
    return { leftKey: left, rightKey: right };
}

/**
 * interpret barometric pressure
 * @param rawdata
 * @returns {{barometricPressure: number}}
 */
SensorTag.interpretBarometricPressure = function(rawdata) {
    var c1 = this._barometricPressureCalibrationData.readUInt16LE(0);
    var c2 = this._barometricPressureCalibrationData.readUInt16LE(2);
    var c3 = this._barometricPressureCalibrationData.readUInt16LE(4);
    var c4 = this._barometricPressureCalibrationData.readUInt16LE(6);

    var c5 = this._barometricPressureCalibrationData.readInt16LE(8);
    var c6 = this._barometricPressureCalibrationData.readInt16LE(10);
    var c7 = this._barometricPressureCalibrationData.readInt16LE(12);
    var c8 = this._barometricPressureCalibrationData.readInt16LE(14);

    var temp = rawdata.readInt16LE(0);
    var pressure = rawdata.readUInt16LE(1);

    var S = c3 + ((c4 * temp)/ 131072.0) + ((c5 * (temp * temp)) / 17179869184.0);
    var O = (c6 * 16384.0) + (((c7 * temp) / 8)) + ((c8 * (temp * temp)) / 524288.0);
    var Pa = (((S * pressure) + O) / 16384.0);

    Pa /= 100.0;
    return { barometricPressure: Pa };
}

/**
 * interpret gyroscope
 * @param rawdata
 * @returns {{x: number, y: number, z: number}}
 */
SensorTag.interpretGyroscope = function(rawdata) {
    var x = rawdata.readInt16LE(0) * 500.0 / 65536.0;
    var y = rawdata.readInt16LE(2) * 500.0 / 65536.0;
    var z = rawdata.readInt16LE(4) * 500.0 / 65536.0;
    return { x: x, y: y, z: z };
}

/**
 * interpret magnetometer
 * @param rawdata
 * @returns {{x: number, y: number, z: number}}
 */
SensorTag.interpretMagnetometer = function(rawdata) {
    var x = rawdata.readInt16LE(0) * 2000.0 / 65536.0;
    var y = rawdata.readInt16LE(2) * 2000.0 / 65536.0;
    var z = rawdata.readInt16LE(4) * 2000.0 / 65536.0;
    return { x: x, y: y, z: z };
}

/**
 * interpret accelerometer
 * @param rawdata
 * @returns {{x: number, y: number, z: number}}
 */
SensorTag.interpretAccelerometer = function(rawdata) {
    var x = rawdata.readInt8(0) * 4.0 / 256.0;
    var y = rawdata.readInt8(1) * 4.0 / 256.0;
    var z = rawdata.readInt8(2) * 4.0 / 256.0;
    return { x: x, y: y, z: z };
}

/**
 * interpret humidity
 * @param rawdata
 * @returns {{temperature: number, humidity: number}}
 */
SensorTag.interpretHumidity = function(rawdata) {
    var temperature = -46.85 + 175.72 / 65536.0 * rawdata.readUInt16LE(0);
    var humidity = -6.0 + 125.0 / 65536.0 * (rawdata.readUInt16LE(2) & ~0x0003);
    return { temperature: temperature, humidity: humidity };
}

/**
 * interpret IR temperature
 * @param rawdata
 * @returns {{objectTemperature: number, ambientTemperature: number}}
 */
SensorTag.interpretIRTemperature = function(rawdata) {
    var ambientTemperature = rawdata.readInt16LE(2) / 128.0;
    var Vobj2 = rawdata.readInt16LE(0) * 0.00000015625;
    var Tdie2 = ambientTemperature + 273.15;
    var S0 = 6.4 * Math.pow(10, -14);
    var a1 = 1.75 * Math.pow(10 ,-3);
    var a2 = -1.678 * Math.pow(10, -5);
    var b0 = -2.94 * Math.pow(10, -5);
    var b1 = -5.7 * Math.pow(10, -7);
    var b2 = 4.63 * Math.pow(10,-9);
    var c2 = 13.4;
    var Tref = 298.15;
    var S = S0 * (1 + a1 * (Tdie2 - Tref) + a2 * Math.pow((Tdie2 - Tref), 2));
    var Vos = b0 + b1 * (Tdie2 - Tref) + b2 * Math.pow((Tdie2 - Tref), 2);
    var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2);
    var objectTemperature = Math.pow(Math.pow(Tdie2, 4) + (fObj/S), 0.25);
    objectTemperature = (objectTemperature - 273.15);
    return { objectTemperature: objectTemperature, ambientTemperature: ambientTemperature };
}

module.exports = SensorTag;
