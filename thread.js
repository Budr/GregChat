'use strict'

import { Deference } from './deference.js'

// For lint:
let fetch = window.fetch

export class User {
  constructor (data) {
    this._data = data
  }

  get name () { return this._data.name }
  get picture () { return this._data.picture }
  get color () { return this._data.color }
}

export class Attachment {
  constructor (data) {
    this._data = data
  }

  get type () { return this._data.type }
  get name () { return this._data.name }
  get link () { return this._data.link }
}

export class Message {
  constructor (data, usersMap) {
    this._data = data
    this._attachments = []
    this._sender = usersMap[data.sender]
    console.log(usersMap)
    this._time = new Date(data.time)
    for (let attachmentData of data.attachments) {
      this._attachments.push(new Attachment(attachmentData))
    }
  }

  get text () { return this._data.text }
  get time () { return this._time }
  get attachments () { return this._attachments }
  get sender () { return this._sender }
}

export class Thread {
  constructor (data) {
    this._data = {}
    this._participants = {}
    this._messages = []
    this._ready = new Deference()
    if (this._isRemote(data)) {
      this._fetchData(data).then(fetched => {
        this._ready.resolve()
        this._loadData(fetched)
      })
    } else {
      this._ready.resolve()
      this._loadData(this._parseData(data))
    }
  }

  /**
   *  # Possible `data` values:
   *
   *  string:
   *    starts with '{': attempt to parse it as JSON
   *    else: attempt to fetch it as a resource (`_isRemote()`), then parse contents as JSON
   *  object:
   *    use it directly
  **/

  _isRemote (raw) { return typeof raw === 'string' && !raw.startsWith('{') }

  async _fetchData (raw) {
    try {
      return (await fetch(raw)).json()
    } catch (error) {
      console.warn('Ivalid thread data resource.', error)
      return {}
    }
  }

  _parseData (raw) {
    let parsed = {}
    if (typeof raw === 'string' && raw.startsWith('{')) {
      try {
        parsed = JSON.parse(raw)
      } catch (error) {
        console.warn('Ivalid JSON thread data.', error)
      }
    } else if (typeof raw === 'object') {
      parsed = raw
    } else {
      console.warn('Invalid thread data.')
    }
    return parsed
  }

  _loadData (parsed) {
    this._data = parsed
    for (let participantData of this._data.participants) {
      this._participants[participantData.name] = new User(participantData)
    }
    for (let messageData of this._data.messages) {
      this._messages.push(new Message(messageData, this.participants))
    }
    return this
  }

  get participants () { return this._participants }
  get messages () { return this._messages }
  get ready () { return this._ready }

  whenReady (f) {
    if (this._ready instanceof Promise) {
      this._ready.then(() => f())
    } else if (this._ready) {
      f()
    }
    return this
  }
}
