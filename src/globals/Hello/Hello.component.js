import React, { Component } from 'react'

class Hello extends Component {
  render () {
    return (
      <div>
        <h2>Hello World!</h2>
        {this.props.children}
      </div>
    )
  }
}

module.exports = Hello
//
//
// import React, { Component } from 'react';
//
// class App extends Component {
//   render() {
//     return (
//       <div>
//         <HeaderContainer />
//         { this.props.children }
//       </div>
//     );
//   }
// }
//
// module.exports = App;