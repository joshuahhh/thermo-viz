import React from 'react';
import dat from 'dat-gui';

// Fun YAGNI idea: single global dat-gui; different components register themselves onto it

var DatGUI = React.createClass({
  childContextTypes: {
    folder: React.PropTypes.any.isRequired,
    controlledComponent: React.PropTypes.any,
  },

  getChildContext() {
    return {
      controlledComponent: this.props.component,
      folder: this.gui
    };
  },

  propTypes: {
    component: React.PropTypes.object,
    autoPlace: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      autoPlace: false
    };
  },

  render() {
    return (
      <div>
        <div ref='container' />
        {this.props.children}
      </div>
    );
  },

  componentWillMount() {
    this.gui = new dat.GUI({autoPlace: this.props.autoPlace});
  },

  componentDidMount() {
    if (!this.props.autoPlace) {
      this.refs.container.appendChild(this.gui.domElement);
    }
  },
});

DatGUI.Folder = React.createClass({
  contextTypes: {
    folder: React.PropTypes.any.isRequired,
  },

  childContextTypes: {
    folder: React.PropTypes.any.isRequired,
  },

  getChildContext() {
    return {
      folder: this.folder
    };
  },

  render() {
    return <noscript>{this.props.children}</noscript>;
  },

  componentWillMount() {
    const {name} = this.props;
    this.folder = this.context.folder.addFolder(name);
  },
});

DatGUI.Add = React.createClass({
  contextTypes: {
    controlledComponent: React.PropTypes.any,
    folder: React.PropTypes.any.isRequired,
  },

  propTypes: {
    stateKey: React.PropTypes.string.isRequired,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    options: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    color: React.PropTypes.bool,
  },

  render() {
    return null;
  },

  componentWillMount() {
    const {min, max, step, options, color,
           value, stateKey, onChange} = this.props;

    // Controller mode

    const numMode = (min !== undefined || max !== undefined || step !== undefined);
    const optionsMode = (options !== undefined);
    const colorMode = (color === true);

    if ((numMode + optionsMode + colorMode) > 1) {
      throw 'too many modes going on here';
    }

    // Backing mode

    const stateKeyMode = (stateKey !== undefined);
    const valueMode = (value !== undefined);

    if ((stateKeyMode + valueMode) != 1) {
      throw 'too many / not enough places to get a value';
    }

    if (stateKey && !this.context.controlledComponent) {
      throw 'cannot use stateKey without a component from above!';
    }

    const label = this.getLabel();
    this.controlledObject = {[label]: this.getValue()};

    if (colorMode) {
      const addArgs = [this.controlledObject, label];
      this.controller = this.context.folder.addColor.apply(this.context.folder, addArgs);
      // Fix for Bootstrap breakage (https://code.google.com/p/dat-gui/issues/detail?id=51):
      this.controller.domElement.querySelector('.hue-field').style.width = '13px';
    } else {
      const addArgs = [this.controlledObject, label].concat(options ? [options] : [min, max, step]);
      this.controller = this.context.folder.add.apply(this.context.folder, addArgs);
      // Do not call the min/max/step methods ever because they will break everything.
      // (See https://github.com/dataarts/dat.gui/issues/74, for instance)
    }

    this.controller.onChange((value) => {
      if (stateKey) this.context.controlledComponent.setState({[stateKey]: value});
      if (onChange) onChange(value);
    });
  },

  getLabel() {
    const {stateKey, name} = this.props;
    return name || stateKey;
  },

  getValue() {
    const {stateKey, value} = this.props;
    return stateKey ? this.context.controlledComponent.state[stateKey] : value;
  },

  componentDidUpdate() {
    this.controlledObject[this.getLabel()] = this.getValue();
    this.controller.updateDisplay();
  },
});


export default DatGUI;
