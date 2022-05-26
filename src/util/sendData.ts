/**
 * The function takes in the request data, and sends it to the processData function,
 * which is imported from the mixNames file. It then returns the userData variable
 * @param {any} data - Input JSON data (to be validated)
 * @returns Return value of function processData.
 */

import { processData } from './mixNames'
export function sendData(data: any) {
    let userData = processData(data)
    return userData
}
