import React, { useEffect, useState} from "react";
import { append, equals, forEach, without } from 'ramda';

/**
 * Creates reactive store with initial value
 */
export const createStore = <S,>(initialStore: S) => {

  let store = initialStore;

  let listeners: ((store: S) => void)[] = [];

  return ({
    updateStore: (f: (store: S) => S): S => {
      store = f(store)
      forEach(f => f(store), listeners);
      return store;
    },
    // withStore: <P,>(WrappedComponent: React.ComponentType<P>, connect: (state: S) => P) => {
    //
    //     type StateFullComponentProps = { connectedProps: P};
    //
    //     return class StateFullComponent extends Component<P, StateFullComponentProps> {
    //
    //       listener: (store: S) => void = () => null;
    //
    //       constructor(props: P) {
    //         super(props);
    //         this.listener = this.setAndDiffState.bind(this);
    //         listeners = append(this.listener, listeners)
    //       }
    //
    //       componentWillUnmount(): void {
    //         listeners = without([this.listener], listeners)
    //       }
    //
    //       state = { connectedProps: connect(store) }
    //
    //       setAndDiffState = (newStore: S) => {
    //         const newProps = connect(newStore);
    //         if(!equals(this.state.connectedProps, newProps))
    //           this.setState({ connectedProps: newProps })
    //       }
    //
    //       render() {
    //         return (<WrappedComponent {...this.state.connectedProps} />);
    //       }
    //     }
    //   },
    useStore: <P,>(connect: (state: S) => P) => {
      const [state, setState] = useState(connect(store));
      const listener = (newStore: S) => {
        const newProps = connect(newStore);
        if(!equals(state, newProps))
          setState(newProps);
      }
      // remove listener when component is unmounted
      // react reports warning when updating unmounted component
      useEffect(
        () => () => {
            listeners = without([listener], listeners);
          }
      );
      listeners = append(listener, listeners);
      return state;
    }
  })
};
