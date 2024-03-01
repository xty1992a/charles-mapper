import os from "os";
import {EventEmitter} from 'events'

export function getIp() {

    let address = '127.0.0.1'
    let interfaces = os.networkInterfaces()
    Object.getOwnPropertyNames(interfaces).forEach((key) => {
        const curr = interfaces[key]
        const alias = curr.find((it) => {
            return it.family === 'IPv4' && it.address !== '127.0.0.1' && !it.internal
        })
        if (address === '127.0.0.1' && alias) {
            address = alias.address
        }
    })

    return address
}


export class Storage extends EventEmitter {
    data = []

    async push(data) {
        this.data.push(data)
        this.emit('push', data)
    }

    async getAll() {
        return this.data
    }
}