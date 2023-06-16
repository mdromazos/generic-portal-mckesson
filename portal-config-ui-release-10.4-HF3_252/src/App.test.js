import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import App from './App';

jest.mock('./pages/login', () => () => <div data-testid="component-identifier">Login Page</div>);
jest.mock('./pages/shell', () => () => <div data-testid="component-identifier">Shell View</div>);

const renderWorkspace = () => render(
  <Router>
    <App />
    <Link data-testid="portals-view" to="/portals">Portals View</Link>
    <Link data-testid="other-urls" to="/other-urls">Other URL</Link>
  </Router>
);

describe('workspace component', () => {
  it('should render LoginPage Component when route is "/"', async () => {
    const { getByTestId } = renderWorkspace();
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Login Page');
    });
  }, 30000);

  it('should render Portals Component when route is "/portal/new"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('portals-view'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Shell View');
    });
  }, 30000);

  it('should render PageNotFoundPage Component when route is "/other-urls"', async () => {
    const { container, getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('other-urls'));
    await wait(() => {
      expect(container.querySelector('h1').innerHTML).toBe('404 Page Not Found - /other-urls');
    });
  }, 30000);
});