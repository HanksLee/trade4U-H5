import * as React from "react";
import { inject, observer } from "mobx-react";
import { toJS } from "mobx";

export default class  extends React.Component {
  state = {
    chart: null,
    chartOption: null,
  };

  constructor(props) {
    super(props);
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      ...nextProps,
    };
  }
  shouldComponentUpdate(nextProps, nextState) {

    return true;
  }

  render() {

    return (
      <div>
      </div>
    );
  }

  componentDidMount() {
   
  }
  componentDidUpdate(prevProps, prevState) {

  }

  //function
 
}
