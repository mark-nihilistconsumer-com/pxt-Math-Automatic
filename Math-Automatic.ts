/*！
 * @file gamePad/main.ts
 * @brief DFRobot's gamer pad makecode library.
 * @n [Get the module here](http://www.dfrobot.com.cn/goods-1577.html)
 * @n This is the microbit dedicated handle library, which provides an API to 
 * control eight buttons, including an led indicator light and a vibrating motor.
 *
 * @copyright	[DFRobot](http://www.dfrobot.com), 2016
 * @copyright	GNU Lesser General Public License
 *
 * @author [email](1035868977@qq.com)
 * @version  V1.0
 * @date  2018-03-20
 */

enum KeyMode {
    //% block=function
    Function = 0,
    //% block=number
    Number = 1
}

//%
enum KeyValue {
    //% block="key 1"
    key1 = 0x80,
    //% block="key 2"
    key2 = 0x40,
    //% block="key 3"
    key3 = 0x20,
    //% block="key +"
    keyplus = 0x10,
    //% block="key 4"
    key4 = 0x200,
    //% block="key 5"
    key5 = 0x100,
    //% block="key 6"
    key6 = 0x400,
    //% block="key -"
    keyminus = 0x800,
    //% block="key 7"
    key7 = 0x4000,
    //% block="key 8"
    key8 = 0x1000,
    //% block="key 9"
    key9 = 0x2000,
    //% block="key *"
    keymul = 0x8000,
    //% block="key DF"
    keydf = 0x01,
    //% block="key 0"
    key0 = 0x02,
    //% block="key ="
    keyequal = 0x04,
    //% block="key /"
    keydiv = 0x08,
    //% block="key any"
    keyany = 0xFFFF
}
interface KV {
    key: KeyValue;
    action: Action;
}
/**
 * Functions for DFRobot gamer:bit Players.
 */
//% weight=10 color=#DF6721 icon="\uf11b" block="Math_Automatic"
namespace keyboard {
    let PIN_INIT = 0;
    //let kbCallback: Action = null;
    //let kbCallback:{[key:number]:Action}={}
    let kbCallback: KV[] = []
    let mathKeyNumber = -1
    let mathKeyFunction = 'none'
    let newKeyFlag = true
    let prevKey = -1
    let key = -1
    let keyRow = 0

    //% weight=60
    //% blockId=key_basic block="key(basic)"
    export function keyBasic(): number {
        let tab = [0x02, 0x80, 0x40, 0x20, 0x200, 0x100, 0x400, 0x4000,
            0x1000, 0x2000, 0x10, 0x800, 0x8000, 0x08, 0x04, 0x01]

        let TPval = pins.i2cReadNumber(0x57, NumberFormat.UInt16BE);
        prevKey = key
        key = -1;
        keyRow = TPval
        for (let i = 0; i < 16; i++) {
            if (TPval & tab[i]) {
                key = i;
                break;
            }
        }

        if (key > 9) {
            if (key != -1) {
                let tmp = ["+", "-", "*", "/", "=", "DF"]
                mathKeyNumber = -1;
                mathKeyFunction = tmp[key - 10]
            }
        } else {
            if ((prevKey != key) && (key != -1)) {
                newKeyFlag = true;
            } else {
                newKeyFlag = false;
            }
            if (newKeyFlag) {
                if (mathKeyNumber == -1) {
                    mathKeyNumber = 0;
                }
                mathKeyNumber = mathKeyNumber * 10 + key;
                newKeyFlag = false;
            }
        }
        return key;
    }
    //% weight=59
    //% blockId=key_math_number block="key number(math)"
    export function keyMathNumber(): number {
        return mathKeyNumber;
    }

    //% weight=58
    //% blockId=key_math_function block="key function(math)"
    export function keyMathFunction(): string {
        return mathKeyFunction;
    }

    //% weight=57
    //% blockId=kb_event block="key pressed |%value"
    export function kbEvent(value: KeyValue, a: Action) {
        let item: KV = { key: value, action: a };
        kbCallback.push(item);
    }
    //% weight=56
    //% blockId=key_pressed block="|%key is pressed?"
    export function keyPressed(key: KeyValue): boolean {
        if (keyRow & key) {
            return true
        } else {
            return false
        }
    }


    basic.forever(() => {
        if (kbCallback != null) {
            let TPval = pins.i2cReadNumber(0x57, NumberFormat.UInt16BE);
            keyBasic()
            if (TPval != 0) {
                for (let item of kbCallback) {
                    if (item.key & TPval) {
                        item.action();
                    }
                }
            }
        }
        basic.pause(20);
    })

}
