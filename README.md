iheartnode
==========

So here's the story, I bought a Polar Bluetooth Smart Heartrate sensor, and thought it would be
fun to hack on - hence the name of this project.

Unfortunately, I just hadn't the faintest idea how BLE works! So, I went out and bought a more
developer friendly device: the TI Sensor Tag: http://www.ti.com/ww/en/wireless_connectivity/sensortag/index.shtml

I did a search through NPM to see if anyone had done anything with Node with BLE.
Fortunately, a smart guy named Sandeep Mistry developed a library called "Noble".

Noble was kind of confusing to me. Though an extremely well written library, the fact is that to work
with Noble, you really needed to understand how BLE operated and understand GATT (https://developer.bluetooth.org/gatt/Pages/GATT-Specification-Documents.aspx)
or "Generic Attribute Profile" specification.

Basically, I didn't understand the hierarchy of devices, services, characteristics, uuids, etc since I was
coming into this fresh. Noble doesn't really address this complete lack of newcomer information.

Luckily, Sandeep also made a project for the SensorTag specifically based on Noble. By dismantling and
rebuilding SensorTag into my own architecture, I learned a lot about BLE and made things simpler (though less featured)
for newcomers.

Lots of logic (especially UUIDs and data parsers) is blatantly ripped off from the SensorTag project,
so please do check it out:

https://github.com/sandeepmistry/node-sensortag (authored by Sandeep Mistry)

I'll be blogging shortly on using BLE devices in node, but I'd like to add a little value to Sandeep's work
and figure out how to use that Polar Heartrate Sensor next. Using the bluetooth spec it should be fairly easy
to randomly try out UUIDs I find to hit the service I want - but it might be a challenge to parse that
raw data.

Stay tuned, and thanks Sandeep for your hard work!