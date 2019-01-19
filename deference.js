'use strict'

export class Deference extends Promise {
  constructor (executor) {
    let resolve, reject
    if (typeof executor !== 'function') {
      executor = (res, rej) => {
        resolve = res
        reject = rej
      }
    }
    super(executor)
    this.resolve = resolve
    this.reject = reject
  }
}
