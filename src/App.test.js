import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import App from './App';

const launchData = [
  {
    flight_number: 1,
    mission_name: 'Falcon 1',
    launch_year: '2006',
    launch_success: true,
    details: 'First launch.',
    launch_site: { site_name_long: 'Launch site A' },
    launch_date_utc: '2006-03-24T22:30:00.000Z'
  },
  {
    flight_number: 2,
    mission_name: 'Atlas V',
    launch_year: '2007',
    launch_success: false,
    details: 'Another mission.',
    launch_site: { site_name_long: 'Launch site B' },
    launch_date_utc: '2007-04-16T22:30:00.000Z'
  },
  {
    flight_number: 3,
    mission_name: 'Starlink',
    launch_year: '2020',
    launch_success: true,
    details: 'Satellite deployment.',
    launch_site: { site_name_long: 'Launch site C' },
    launch_date_utc: '2020-11-13T22:30:00.000Z'
  }
];

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(launchData)
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

it('loads launches from the SpaceX API and renders them', async () => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  act(() => {
    ReactDOM.render(<App />, div);
  });

  await flushPromises();

  expect(global.fetch).toHaveBeenCalledWith('https://api.spacexdata.com/v3/launches');
  expect(div.textContent).toContain('Falcon 1');
  expect(div.textContent).toContain('Atlas V');
  expect(div.textContent).toContain('Starlink');

  ReactDOM.unmountComponentAtNode(div);
  div.remove();
});

it('filters launches by search', async () => {
  const div = document.createElement('div');
  document.body.appendChild(div);

  act(() => {
    ReactDOM.render(<App />, div);
  });

  await flushPromises();

  const input = div.querySelector('input[type="search"]');

  act(() => {
    input.value = 'atlas';
    Simulate.change(input, { target: { value: 'atlas' } });
  });

  await flushPromises();

  expect(div.textContent).toContain('Atlas V');
  expect(div.textContent).not.toContain('Falcon 1');

  ReactDOM.unmountComponentAtNode(div);
  div.remove();
});
