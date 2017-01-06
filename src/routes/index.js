// import React from 'react'
// import { Router, Route, hashHistory } from 'react-router'
//
// import CoreLayout from '../globals/CoreLayout'
// import Bills from './Bills'
//
// const Routes = (props) => {
//   return (
//     <Router {...props} history={hashHistory}>
//       <Route path='/' component={CoreLayout}>
//         {Bills()}
//       </Route>
//     </Router>
//   )
// }
//
// export default Routes

import CoreLayout from '../globals/CoreLayout'

export const createRoutes = (store) => {
  const routes = {
    path: '/',
    component: CoreLayout,
    getChildRoutes (location, next) {
      require.ensure([], (require) => {
        next(null, [
          require('./Bills').default(store)
        ])
      })
    }
  }

  return routes
}

export default createRoutes
