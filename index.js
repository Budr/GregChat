'use strict'

import { Thread } from './thread.js'

let thread = new Thread('./example_data.json')

thread.ready.then(() => {
  console.log(thread)
})
