import React from 'react';
import _ from 'underscore';

import {Svg, LoBox, LoMargins, Rect, PlotRegion, Circle, AnimationLoop} from '../react-viz/all';

import 'bootstrap/dist/css/bootstrap.min.css';

var App = React.createClass({
  getInitialState() {
    return {
      clicks: 0
    };
  },

  render() {
    return (
      <Svg>
        <PlotRegion xDomain={[0, 1]} yDomain={[0, 1]}>
          <Rect x1D='left' x2D='right' y1D='top' y2D='bottom' style={{fill: 'none', stroke: 'black'}} />
        </PlotRegion>
        <LoMargins left={10} right={10} top={10} bottom={10}>
          <Gas width={100} height={150}/>
        </LoMargins>
      </Svg>
    );
  },

  onClick() {
    this.setState({clicks: this.state.clicks + 1});
  }
});

var radius = 3;

var Gas = React.createClass({
  getInitialState() {
    const {width, height} = this.props;

    return {
      // particles: [new Particle([10, 10], [1, 1])],
      particles: _.range(10).map(() => new Particle([Math.random() * width, Math.random() * height], [Math.random() * 2 - 1, Math.random() * 2 - 1])),
    };
  },

  render() {
    const {width, height} = this.props;
    const {particles} = this.state;

    return (
      <LoBox width={width} height={height}>
        <AnimationLoop step={this.animationStep} />
        <PlotRegion>
          <Rect x1D='left' x2D='right' y1D='top' y2D='bottom' style={{fill: 'none', stroke: 'black'}} />
          {particles.map((particle, i) =>
            <Circle key={i} cxD={particle.pos[0]} cyD={particle.pos[1]} r={radius} style={{fill: 'red'}} />
          )}
        </PlotRegion>
      </LoBox>
    );
  },

  animationStep() {
    const {width, height} = this.props;
    var {particles} = this.state;

    particles.forEach((particle) => {
      particle.pos[0] = particle.pos[0] + particle.vel[0];
      particle.pos[1] = particle.pos[1] + particle.vel[1];
      if (particle.pos[0] < radius || particle.pos[0] > width - radius) {
        particle.vel[0] *= -1;
      }
      if (particle.pos[1] < radius || particle.pos[1] > height - radius) {
        particle.vel[1] *= -1;
      }
    });
    this.setState({particles: particles});
  }
});

class Particle {
  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
  }
}

export default App;
