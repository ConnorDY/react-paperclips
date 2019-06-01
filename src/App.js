import React, { useState, useEffect } from 'react';
import useInterval from '@use-it/interval';
import roundTo from 'round-to';

import Business from './Business';
import Marketing from './Marketing';
import Manufacturing from './Manufacturing';
import Computation from './Computation';
import Projects from './Projects';

const speedFactor = 1 / 5;

// adjust for debugging
const startClips = 2500;
const startCash = 2000;

const App = () => {
  // init state
  const [cash, setCash] = useState(startCash);
  const [cashPerSecond, setCashPerSecond] = useState(0);
  const [profitList, setProfitList] = useState([0]);

  const [clips, setClips] = useState(startClips);
  const [totalClips, setTotalClips] = useState(startClips);
  const [clipPrice, setClipPrice] = useState(0.25);
  const [clipsPerSecond, setClipsPerSecond] = useState(0);
  const [manualClips, setManualClips] = useState(0);
  const [clipsList, setClipsList] = useState([0]);

  const [demand, setDemand] = useState(1);
  const [demandFactor, setDemandFactor] = useState(1);
  const [marketing, setMarketing] = useState(1);
  const [marketingPrice, setMarketingPrice] = useState(100);

  const [wire, setWire] = useState(1000);
  const [wirePrice, setWirePrice] = useState(20);
  const [wirePerSpool, setWirePerSpool] = useState(1000);
  const [wireCounter, setWireCounter] = useState(0);

  const [clippers, setClippers] = useState(0);
  const [clipperPrice, setClipperPrice] = useState(5);

  const [trust, setTrust] = useState(2);
  const [trustMilestone, setTrustMilestone] = useState(3000);
  const [fib1, setFib1] = useState(2);
  const [fib2, setFib2] = useState(3);

  const [processors, setProcessors] = useState(1);
  const [memory, setMemory] = useState(1);
  const [ops, setOps] = useState(0);
  const [creativity, setCreativty] = useState(0);

  // save/load state
  const saveState = () => {
    const state = JSON.stringify({
      cash,

      clips,
      totalClips,
      clipPrice,

      demandFactor,
      marketing,
      marketingPrice,

      wire,
      wirePrice,
      wirePerSpool,
      wireCounter,

      clippers,
      clipperPrice,

      trust,
      trustMilestone,
      fib1,
      fib2,

      processors,
      memory,
      ops,
      creativity
    });

    localStorage.setItem('gameState', state);

    console.log('Saved');
  };

  const loadState = () => {
    const lcs = localStorage.getItem('gameState');
    if (!lcs) return;

    const state = JSON.parse(lcs);

    setCash(state.cash);

    setClips(state.clips);
    setTotalClips(state.totalClips);
    setClipPrice(state.clipPrice);

    setDemandFactor(state.demandFactor);
    setMarketing(state.marketing);
    setMarketingPrice(state.marketingPrice);

    setWire(state.wire);
    setWirePrice(state.wirePrice);
    setWirePerSpool(state.wirePerSpool);
    setWireCounter(state.wireCounter);

    setClippers(state.clippers);
    setClipperPrice(state.clipperPrice);

    setTrust(state.trust);
    setTrustMilestone(state.trustMilestone);
    setFib1(state.fib1);
    setFib2(state.fib2);

    setProcessors(state.processors);
    setMemory(state.memory);
    setOps(state.ops);
    setCreativty(state.creativity);
  };

  // make single clip
  const makeOneClip = () => {
    setManualClips(manualClips + 1);
  };

  // make clips
  const makeClips = (num, _clips) => {
    if (num > wire) num = wire;
    return num;
  };

  // sell clips
  const sellClips = (num, _clips) => {
    if (num > _clips) num = _clips;

    _clips -= num;
    const profit = clipPrice * num;
    setCash(cash + profit);

    return [num, profit];
  };

  // increase or decrease the price of a clip
  const increasePrice = () => {
    setClipPrice(roundTo(clipPrice + 0.01, 2));
  };

  const decreasePrice = () => {
    if (clipPrice < 0.02) return;
    setClipPrice(roundTo(clipPrice - 0.01, 2));
  };

  // increase marketing level
  const increaseMarketing = () => {
    setMarketing(marketing + 1);
    setMarketingPrice(marketingPrice * 2);
    setCash(cash - marketingPrice);
  };

  // increase processors
  const increaseProcessors = () => {
    setProcessors(processors + 1);
  };

  // increase memory
  const increaseMemory = () => {
    setMemory(memory + 1);
  };

  // buy wire
  const buyWire = () => {
    setWire(wire + wirePerSpool);
    setCash(cash - wirePrice);
  };

  // buy auto clipper
  const buyClipper = () => {
    setClippers(clippers + 1);
    setCash(cash - clipperPrice);
    setClipperPrice(1.1 ** (clippers + 1) + 5);
  };

  // calculate market demand
  const calcDemand = () => {
    setDemand(
      roundTo((0.8 / clipPrice) * 1.1 ** (marketing - 1) * demandFactor, 2)
    );
  };

  // tick every second
  useInterval(() => {
    // current clips
    const _clips = clips + manualClips;

    // create clips with auto-clippers
    let autoClips = 0;
    if (clippers > 0) {
      autoClips = makeClips(roundTo(clippers * speedFactor, 3), _clips);
    }

    // update wire amount
    setWire(wire - autoClips - manualClips);

    // sell clips at a rate according to the market demand
    let profit = 0;
    let sold = 0;
    if (_clips > 0)
      [sold, profit] = sellClips(
        roundTo(0.7 * demand ** 1.15 * speedFactor, 3),
        _clips
      );

    // update unsold and total clips
    setClips(_clips + autoClips - sold);
    setTotalClips(totalClips + autoClips + manualClips);

    // average clips per second
    const mc = [...clipsList];

    if (mc.unshift(manualClips) > 5) mc.pop();
    setClipsList(mc);

    const mcTotal = mc.reduce((tot, v) => tot + v, 0);
    setClipsPerSecond(clippers + mcTotal / speedFactor / mc.length);
    setManualClips(0);

    // average cash per second
    const profits = [...profitList];

    if (profits.unshift(profit) > 5) profits.pop();
    setProfitList(profits);

    const pTotal = profits.reduce((tot, v) => tot + v, 0);
    setCashPerSecond(pTotal / speedFactor / profits.length);

    // update wire price
    if (Math.random() < 0.015) {
      setWireCounter(wireCounter + 0.25);
      setWirePrice(Math.ceil(20 + 6 * Math.sin(wireCounter + 0.25)));
    }

    // calculate trust (using the fibonacci sequence)
    if (totalClips >= trustMilestone) {
      setTrust(trust + 1);
      const fibNext = fib1 + fib2;
      setTrustMilestone(fibNext * 1000);
      setFib1(fib2);
      setFib2(fibNext);
    }

    // calculate operations
    if (ops < memory * 1000) {
      let opCycle = processors / speedFactor;
      const opBuf = memory * 1000 - ops;

      if (opCycle > opBuf) opCycle = opBuf;

      setOps(ops + opCycle);
    } else setCreativty(creativity + processors / 20 / speedFactor);
  }, 1000 * speedFactor);

  // save every 5 seconds
  useInterval(saveState, 5000);

  // re-calculate the demand whenever the price or market demand factor changes
  useEffect(calcDemand, [clipPrice, demandFactor, marketing]);

  // load state on launch
  useEffect(loadState, []);

  // render
  return (
    <table>
      <tbody>
        <tr>
          {/* Row 1, Col 1 */}
          <td>
            <Business
              totalClips={Math.floor(totalClips) + manualClips}
              clips={Math.floor(clips) + manualClips}
              cash={cash}
              cashPerSecond={cashPerSecond}
              clipPrice={clipPrice}
              increasePrice={increasePrice}
              decreasePrice={decreasePrice}
              demand={demand}
              wire={wire - manualClips}
              makeOneClip={makeOneClip}
            />
          </td>
          {/* Row 1, Col 2 */}
          <td>
            {totalClips >= 2000 ? (
              <Computation
                trust={trust}
                trustMilestone={trustMilestone}
                processors={processors}
                memory={memory}
                ops={Math.floor(ops)}
                creativity={Math.floor(creativity)}
                increaseProcessors={increaseProcessors}
                increaseMemory={increaseMemory}
              />
            ) : (
              ''
            )}
          </td>
        </tr>
        <tr>
          {/* Row 2, Col 1 */}
          <td>
            <Marketing
              marketing={marketing}
              increaseMarketing={increaseMarketing}
              marketingPrice={marketingPrice}
              cash={cash}
            />
            <br />
            <br />
            <Manufacturing
              wire={Math.floor(wire) - manualClips}
              wirePrice={wirePrice}
              cash={cash}
              clipsPerSecond={clipsPerSecond}
              buyWire={buyWire}
              clippers={clippers}
              buyClipper={buyClipper}
              clipperPrice={clipperPrice}
            />
          </td>
          {/* Row 2, Col 2 */}
          <td>
            <Projects />
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default App;
