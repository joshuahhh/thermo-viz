import React from 'react';
import _ from 'underscore';

import {Svg, LoBox, LoRow, LoMargins, Rect, PlotRegion, Circle, AnimationLoop,
  Text, Line} from '../react-viz/all';

import DatGUI from './DatGUI';

import 'bootstrap/dist/css/bootstrap.min.css';

var App = React.createClass({
  getInitialState() {
    return {
      clicks: 0,
      velMul: 1,
      numParticles: 10,
      particleColor: '#ff0000',
      width: 200,
    };
  },

  render() {
    return (
      <div>
        <Svg>
          <PlotRegion xDomain={[0, 1]} yDomain={[0, 1]}>
            <Rect x1D='left' x2D='right' y1D='top' y2D='bottom' style={{fill: 'none', stroke: 'black'}} />
          </PlotRegion>
          <LoRow>
            <Gas width={this.state.width} height={300}
              numParticles={this.state.numParticles} velMul={this.state.velMul}
              particleColor={this.state.particleColor}/>
            <Gas width={this.state.width} height={300}
              numParticles={this.state.numParticles} velMul={this.state.velMul}
              particleColor={this.state.particleColor}/>
          </LoRow>
        </Svg>
        <DatGUI component={this} autoPlace={true}>
          <DatGUI.Add stateKey='numParticles' min={0} max={65} step={1}/>
          <DatGUI.Add name='temp' stateKey='velMul' min={0.5} max={3} step={0.01}/>
          <DatGUI.Add stateKey='particleColor' color/>
          <DatGUI.Add stateKey='width' min={0} max={400} step={1}/>
          <DatGUI.Folder name='Fun stuff'></DatGUI.Folder>
        </DatGUI>
      </div>
    );
  },

  onClick() {
    this.setState({clicks: this.state.clicks + 1});
  }
});

var radius = 3;

var Gas = React.createClass({
  makeParticle() {
    const {width, height} = this.props;
    return new Particle(
      [Math.random() * width, Math.random() * height],
      [0.1 * (Math.random() * 2 - 1), 0.1 * (Math.random() * 2 - 1)]);
  },

  getInitialState() {
    return {
      particles: [],
      leftHits: 0,
      rightHits: 0,
      topHits: 0,
      bottomHits: 0,
    };
  },

  render() {
    const {width, height} = this.props;
    const {particles} = this.state;
    const {leftHits, rightHits, topHits, bottomHits} = this.state;

    return (
      <LoMargins left={40} right={20} top={20} bottom={20}>
        <LoBox width={width} height={height}>
          <AnimationLoop step={this.animationStep} targetFps={20}/>
          <PlotRegion>
            <Rect x1D='left' x2D='right' y1D='top' y2D='bottom' style={{fill: 'none', stroke: 'black'}} />
            {particles.map(this.renderParticle)}
            <Text xD='left' yD='center' hAlign='right' x={-5}>{leftHits}</Text>
            <Text xD='right' yD='center' hAlign='left' x={5}>{rightHits}</Text>
            <Text xD='center' yD='top' vAlign='bottom' hAlign='center' y={-3}>{topHits}</Text>
            <Text xD='center' yD='bottom' vAlign='top' hAlign='center' y={3}>{bottomHits}</Text>
          </PlotRegion>
        </LoBox>
      </LoMargins>
    );
  },

  renderParticle(particle, i) {
    const {particleColor} = this.props;
    const {pos, vel} = particle;

    return (
      <g key={i}>
        <Line x1D={pos[0]} y1D={pos[1]}
          x2D={pos[0] - vel[0] * 100} y2D={pos[1] - vel[1] * 100} stroke='black'/>
        <Circle cxD={pos[0]} cyD={pos[1]} r={radius} style={{fill: particleColor}} />
      </g>
    );
  },

  animationStep(elapsed) {
    if (!elapsed) {
      return;
    }

    const {width, height, velMul} = this.props;
    var {particles} = this.state;
    const {leftHits, rightHits, topHits, bottomHits} = this.state;

    particles.forEach((particle) => {
      particle.pos[0] = particle.pos[0] + particle.vel[0] * velMul * elapsed;
      particle.pos[1] = particle.pos[1] + particle.vel[1] * velMul * elapsed;
      if (particle.pos[0] < radius) {
        particle.pos[0] = radius;
        particle.vel[0] = Math.abs(particle.vel[0]);
        this.setState({leftHits: leftHits + 1});
      } else if (particle.pos[0] > width - radius) {
        particle.pos[0] = width - radius;
        particle.vel[0] = -Math.abs(particle.vel[0]);
        this.setState({rightHits: rightHits + 1});
      }
      if (particle.pos[1] < radius) {
        particle.pos[1] = radius;
        particle.vel[1] = Math.abs(particle.vel[1]);
        this.setState({topHits: topHits + 1});
      } else if (particle.pos[1] > height - radius) {
        particle.pos[1] = height - radius;
        particle.vel[1] = -Math.abs(particle.vel[1]);
        this.setState({bottomHits: bottomHits + 1});
      }
    });
    this.setState({particles: particles});
  },

  componentWillMount() {
    this.syncState(this.props);
  },

  componentWillReceiveProps(nextProps) {
    this.syncState(nextProps);
  },

  syncState(nextProps) {
    const {particles} = this.state;
    const numParticles = particles.length;

    if (nextProps.numParticles < numParticles) {
      this.setState({particles: particles.slice(0, nextProps.numParticles)});
    } else if (nextProps.numParticles > numParticles) {
      this.setState({particles: particles.concat(_.range(nextProps.numParticles - numParticles).map(this.makeParticle))});
    }
  }
});

class Particle {
  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
  }
}

export default App;
