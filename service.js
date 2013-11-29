Service = function(characteristics, serviceJSON) {

    /**
     * get service profile JSON
     * @returns {*}
     */
    this.getProfile = function() {
        return serviceJSON;
    }

    /**
     * get characteristic reference by name
     * @param characteristicName
     * @returns {*}
     */
    this.getCharacteristicByName = function(characteristicName) {
        var uuid = this.getUUIDByName(characteristicName);
        return this.getCharacteristicByUUID(uuid);
    }

    /**
     * get uuid for a specific characteristic
     * @param characteristicName
     * @returns {*}
     */
    this.getUUIDByName = function(characteristicName) {
        for (var chr in serviceJSON.characteristics) {
            if (chr == characteristicName) {
                return serviceJSON.characteristics[chr];
            }
        }
    }

    /**
     * get characteristic ref from device with UUID
     * @param uuid
     * @returns {*}
     */
    this.getCharacteristicByUUID = function(uuid) {
        for (var c in characteristics) {
            if (characteristics[c].uuid == uuid) {
                return characteristics[c];
            }
        }
    }
}
module.exports = Service;