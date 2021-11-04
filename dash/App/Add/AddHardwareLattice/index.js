import React from 'react'
import Restore from 'react-restore'

import link from '../../../../resources/link'
import svg from '../../../../resources/svg' // TODO: get gridplus svg

function parseDeviceName (name) {
  if (!name) return 'Frame'

  // Lattice supports a device name of up to 24 characters and we append 
  // a dash and a 6 character device code to the end, so limit this to 17 characters
  return name.replace(/\s+/g, '-').substring(0, 17)
}

class AddHardwareLattice extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = {
      adding: false,
      index: 0,
      status: '',
      error: false,
      deviceId: '',
      deviceName: 'Frame',
      pairCode: ''
    }
    this.forms = [React.createRef(), React.createRef(), React.createRef(), React.createRef()]
  }

  onChange (key, e) {
    e.preventDefault()

    const value = (key === 'deviceName')
      ? parseDeviceName(e.target.value)
      : e.target.value
    
    this.setState({ [key]: value || '' })
  }

  onBlur (key, e) {
    e.preventDefault()
    const update = {}
    update[key] = this.state[key] || ''
    this.setState(update)
  }

  onFocus (key, e) {
    e.preventDefault()
    if (this.state[key] === '') {
      const update = {}
      update[key] = ''
      this.setState(update)
    }
  }

  currentForm () {
    return this.forms[this.state.index]
  }

  blurActive () {
    const formInput = this.currentForm()
    if (formInput && formInput.current) formInput.current.blur()
  }

  focusActive () {
    setTimeout(() => {
      const formInput = this.currentForm()
      if (formInput && formInput.current) formInput.current.focus()
    }, 500)
  }

  next () {
    this.blurActive()
    this.setState({ index: ++this.state.index })
    this.focusActive()
  }

  createLattice () {
    link.rpc('createLattice', this.state.deviceId, this.state.deviceName, (err, signer) => {
      if (err) {
        this.setState({ status: err, error: true })
      } else {
        this.setState({ status: 'Successful', error: false })

        // TODO: signal some sort of success and close this more gracefully
        this.props.close()
      }
    })
  }

  capitalize (s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  restart () {
    this.setState({ adding: false, index: 0, pairCode: '' })
    setTimeout(() => {
      this.setState({ status: '', error: false })
    }, 500)
    this.focusActive()
  }

  render () {
    let itemClass = 'addAccountItem addAccountItemSmart addAccountItemAdding'

    return (
      <div className={itemClass} style={{ transitionDelay: (0.64 * this.props.index / 4) + 's' }}>
        <div className='addAccountItemBar' />
        <div className='addAccountItemWrap'>
          <div className='addAccountItemTop'>
            <div className='addAccountItemTopType'>
              <div className='addAccountItemIcon'>
                <div className='addAccountItemIconType addAccountItemIconHardware'>{svg.lattice(24)}</div>
              </div>
              <div className='addAccountItemTopTitle'>Lattice</div>
            </div>
            <div className='addAccountItemClose' onMouseDown={() => this.props.close()}>{svg.close(24)}</div>
            <div className='addAccountItemSummary'>GridPlus Lattice1</div>
          </div>
          <div className='addAccountItemOption'>
            <div
              className='addAccountItemOptionSetup'
              style={{ transform: `translateX(-${100 * this.state.index}%)` }}
            >
              <div className='addAccountItemOptionSetupFrames'>
                <div className='addAccountItemOptionSetupFrame'>
                  <div className='addAccountItemOptionTitle'>Device Name</div>
                  <div className='addAccountItemOptionInputPhrase'>
                    <input
                      tabIndex='-1' ref={this.forms[0]} value={this.state.deviceName}
                      onChange={e => this.onChange('deviceName', e)}
                      onFocus={e => this.onFocus('deviceName', e)}
                      onBlur={e => this.onBlur('deviceName', e)} 
                      onKeyPress={e => { 
                        if (e.key === 'Enter') {
                          this.next()
                        }
                      }}
                    />
                  </div>
                  <div
                    className='addAccountItemOptionSubmit'
                    onMouseDown={() => {
                      this.next()
                    }}
                  >Next
                  </div>
                </div>
                <div className='addAccountItemOptionSetupFrame'>
                  <div className='addAccountItemOptionTitle'>Enter device id</div>
                  <div className='addAccountItemOptionInputPhrase'>
                    <input
                      tabIndex='-1' ref={this.forms[1]} value={this.state.deviceId}
                      onChange={e => this.onChange('deviceId', e)}
                      onFocus={e => this.onFocus('deviceId', e)}
                      onBlur={e => this.onBlur('deviceId', e)} 
                      onKeyPress={e => { 
                        if (e.key === 'Enter') {
                          this.createLattice()
                          this.next()
                        }
                      }}
                    />
                  </div>
                  <div
                    className='addAccountItemOptionSubmit'
                    onMouseDown={() => {
                      this.createLattice()
                      this.next()
                    }}
                  >Create
                  </div>
                </div>
                <div className='addAccountItemOptionSetupFrame'>
                    <>
                      <div className='phaseItemOptionTitle'>{this.state.status}</div>
                      {this.state.error ? <div className='phaseItemOptionSubmit' onMouseDown={() => this.restart()}>try again</div> : null}
                    </>
                </div>
              </div>
            </div>
          </div>
          <div className='addAccountItemFooter' />
        </div>
      </div>
    )
  }
}

export default Restore.connect(AddHardwareLattice)
