import React from 'react'
import { Provider } from 'react-redux'
// import { expect } from 'chai'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import createFakeStore from 'utilities/createFakeStore'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect

import BillsContainer from './Bills.container'
import BillsComponent from './Bills.component'
import billsData from './Bills.data'
import billsReducer, { fetchBills, requestBills, recieveBills, recieveErr } from './Bills.modules'

import Promise from 'promise-polyfill'

// To add to window
if (!window.Promise) {
  window.Promise = Promise
}

describe('BILLS TESTS', () => {
  const setup = () => {
    const props = {
      fetchBills: sinon.spy(),
      bills: billsData,
      appShouldFetchContent: false
    }

    const fakeStore = createFakeStore({
      bills: { bills: billsData },
      coreLayout: { appShouldFetchContent: false }
    })

    const ContainerWrapper = mount(
      <Provider store={fakeStore}>
        <BillsContainer />
      </Provider>,
    ).find(BillsContainer)

    const ComponentWrapper = shallow(<BillsComponent {...props} />)

    return {
      ContainerWrapper,
      ComponentWrapper,
      props
    }
  }

  context('Bills container', () => {
    it('should render the Bills component', () => {
      const { ContainerWrapper } = setup()
      expect(ContainerWrapper).to.exist
    })

    it('should render 20 bill components when mounted', () => {
      const { ContainerWrapper } = setup()
      expect(ContainerWrapper.find('article').length).to.equal(20)
    })
  })

  context('Bills component', () => {
    it('should call fetchBills once when mounted', () => {
      const { ComponentWrapper, props } = setup()
      expect(props.fetchBills).to.have.property('callCount', 1)
    })

    it('should call fetchBills again props.appShouldFetchContent is changed to true', () => {
      const { ComponentWrapper, props } = setup()
      expect(props.fetchBills).to.have.property('callCount', 1)
      ComponentWrapper.setProps({ appShouldFetchContent: true })
      expect(props.fetchBills).to.have.property('callCount', 2)
    })
  })

  context('Bills action creators', () => {
    it('Should export five functions: fetchBills, billsReducer, recieveErr, recieveBills, requestBills', () => {
      // module exports imported at top of file
      expect(fetchBills).to.a('function')
      expect(billsReducer).to.a('function')
      expect(recieveErr).to.a('function')
      expect(recieveBills).to.a('function')
      expect(requestBills).to.a('function')
    })

    it('requestBills() should take no parameters and return a proper REQUEST_BILLS action object', () => {
      const expectedAction = {
        type: 'REQUEST_BILLS'
      }

      expect(requestBills()).to.deep.equal(expectedAction)
    })

    it('recieveBills() should take a bills array as a parameter and return a proper RECIEVE_BILLS action object', () => {
      const expectedAction = {
        type: 'RECIEVE_BILLS',
        bills: billsData
      }

      expect(recieveBills(billsData)).to.deep.equal(expectedAction)
    })

    it('recieveErr() should take no parameters and return a proper RECIEVE_ERR action object', () => {
      const expectedAction = {
        type: 'RECIEVE_ERR',
        err: 'test error'
      }

      expect(recieveErr('test error')).to.deep.equal(expectedAction)
    })
  })

  context('Bills async actions', () => {
    const middlewares = [ thunk ]
    const mockStore = configureMockStore(middlewares)

    let server

    it('should actually run an async test', () => {
      before(() => {
        server = sinon.fakeServer.create()
        const response = [200, { 'Content-type': 'application/json' }, billsData]
        server.respondWith('GET', 'http://localhost:3001/api/bills/1', JSON.stringify(response))
      })

      after(() => {
        server.restore()
      })

      let expectedActions = [
        { type: 'REQUEST_BILLS' },
        { type: 'RECIEVE_BILLS', bills: billsData }
      ]
      const store = mockStore({
        bills: { bills: billsData },
        coreLayout: { appShouldFetchContent: false }
      })

      return store.dispatch(fetchBills())
        .then(() => {
          return Promise.resolve(store.getActions())
        })
        .then((resolved) => {
          console.log('PROMIS: ', Promise.resolve(store.getActions()))
          console.log('RESOLV: ', resolved)
          console.log('EXPECT: ', expectedActions)
          return expect(Promise.resolve(store.getActions())).to.eventually.deep.equal(expectedActions)
          // return expect(Promise.resolve(resolved)).to.eventually.deep.equal(expectedActions)
          // return expect(resolved).to.eventually.deep.equal(expectedActions)
          // expect(resolved).to.deep.equal(expectedActions)
        })
    })
  })

  context('Bills reducer (action handlers)', () => {
    it('REQUEST_BILLS | should set fetching to true', () => {
      const REQUEST_BILLS = requestBills()

      const initialState = {
        bills: billsData
      }

      const expectedState = {
        bills: billsData,
        fetching: true
      }

      expect(billsReducer(initialState, REQUEST_BILLS)).to.deep.equal(expectedState)
    })

    it('RECIEVE_BILLS | should append fetched bills to the bills array and set fetching to false', () => {
      const RECIEVE_BILLS = recieveBills(billsData)

      const initialState = {
        appShouldFetchContent: false,
        bills: billsData,
        fetching: true
      }

      const expectedState = {
        appShouldFetchContent: false,
        bills: [ ...billsData, ...billsData ],
        fetching: false
      }

      expect(billsReducer(initialState, RECIEVE_BILLS)).to.deep.equal(expectedState)
    })

    it('RECIEVE_ERR | should return the error and set fetching to false', () => {
      const RECIEVE_ERR = recieveErr('test error')

      const initialState = {
        appShouldFetchContent: false,
        bills: billsData,
        fetching: true
      }

      const expectedState = {
        appShouldFetchContent: false,
        bills: billsData,
        err: 'test error',
        fetching: false
      }

      expect(billsReducer(initialState, RECIEVE_ERR)).to.deep.equal(expectedState)
    })
  })
})
