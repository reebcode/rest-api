import { processData } from './mixNames'
export function sendData(data: any) {
    let userData = processData(data)
    return userData
}
