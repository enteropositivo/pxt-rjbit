/*
Riven
RJ25 Extension for robotbit
load dependency
"rjbit": "file:../pxt-rjbit"
*/

//% color="#00bbff" weight=10 icon="\uf1b9"
namespace rjbit {
    export enum Ports {
        PORT1 = 0,
        PORT2 = 1,
        PORT3 = 2,
        PORT4 = 3
    }

    export enum PortsA {
        PORT3 = 2
    }

    const PortDigi = [
        [DigitalPin.P13, DigitalPin.P14],
        [DigitalPin.P15, DigitalPin.P16],
        [DigitalPin.P1, DigitalPin.P2],
        [DigitalPin.P3, DigitalPin.P4]
    ]

    const PortAnalog = [
        AnalogPin.P0,
        AnalogPin.P1,
        AnalogPin.P2,
        null
    ]

    export enum Slots {
        A = 0,
        B = 1
    }

    export enum DHT11Type {
        //% block=temperature(°C)
        TemperatureC = 0,
        //% block=temperature(°F)
        TemperatureF = 1,
        //% block=humidity
        Humidity = 2
    }

    let distanceBuf = 0;
    let dht11Temp = -1;
    let dht11Humi = -1;

    //% shim=powerbrick::dht11Update
    function dht11Update(pin: number): number {
        return 999;
    }

    //% blockId=rjbit_ultrasonic block="Ultrasonic|port %port"
    //% weight=91
    export function Ultrasonic(port: Ports): number {
        // send pulse
        let pin = PortDigi[port][0]
        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pin, 0);

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 25000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && distanceBuf != 0) {
            ret = distanceBuf;
        }
        distanceBuf = d;
        return Math.floor(ret * 10 / 6 / 58);
    }

    //% blockId=rjbit_tracer block="Tracer|port %port|slot %slot"
    //% weight=81
    export function Tracer(port: Ports, slot: Slots): boolean {
        let pin = PortDigi[port][slot]
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin) == 1
    }

    //% blockId=rjbit_onTracerEvent block="on Tracer|%port|slot %slot touch black"
    export function onTracerEvent(port: Ports, slot: Slots, handler: () => void): void {
        let pin = PortDigi[port][slot]
        pins.setPull(pin, PinPullMode.PullUp)
        pins.onPulsed(pin, PulseValue.High, handler)
    }

    //% blockId=rjbit_sound block="Sound|port %port"
    export function SoundSensor(port: PortsA): number {
        let pin = PortAnalog[port]
        return pins.analogReadPin(pin)
    }

    //% blockId=rjbit_dht11 block="DHT11|port %port|type %readtype"
    export function DHT11(port: Ports, readtype: DHT11Type): number {
        let pin = PortDigi[port][0]

        // todo: get pinname in ts
        let value = (dht11Update(pin - 7) >> 0)

        if (value != 0) {
            dht11Temp = (value & 0x0000ff00) >> 8;
            dht11Humi = value >> 24;
        }
        if (readtype == DHT11Type.TemperatureC) {
            return dht11Temp;
        } else if (readtype == DHT11Type.TemperatureF) {
            return Math.floor(dht11Temp * 9 / 5) + 32;
        } else {
            return dht11Humi;
        }
    }

    //% blockId=rjbit_onPIREvent block="on PIR|%port triggered"
    export function onPIREvent(port: Ports, handler: () => void): void {
        let pin = PortDigi[port][0]
        pins.setPull(pin, PinPullMode.PullUp)
        pins.onPulsed(pin, PulseValue.High, handler)
    }

    //% blockId=rjbit_touch block="Touch|port %port"
    export function Touch(port: Ports): boolean {
        let pin = PortDigi[port][0]
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin) == 0
    }

    //% blockId=rjbit_onTouchEvent block="on Touch|%port touched"
    export function onTouchEvent(port: Ports, slot: Slots, handler: () => void): void {
        let pin = PortDigi[port][0]

        pins.setPull(pin, PinPullMode.PullUp)
        pins.onPulsed(pin, PulseValue.Low, handler)
    }





}








