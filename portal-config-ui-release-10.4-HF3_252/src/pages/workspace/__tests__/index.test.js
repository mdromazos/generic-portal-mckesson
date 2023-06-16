import React from 'react';
import { render, wait, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import Workspace from '../index';

jest.mock('../../../components/portals/portalsView', () => () => <div data-testid="component-identifier">Portals View</div>);
jest.mock('../../../components/portals/portalView/portalSettings', () => () => <div data-testid="component-identifier">Portal View / Portal Settings</div>);
jest.mock('../../../components/portals/portalView', () => () => <div data-testid="component-identifier">Portal View</div>);
jest.mock('../../../components/portalPages/pageView', () => () => <div data-testid="component-identifier">Portal Pages / Page View</div>);
jest.mock('../../../components/portals/runtimeConfig', () => () => <div data-testid="component-identifier">Runtime Configuration</div>);

const renderWorkspace = () => render(
  <Router>
    <Workspace />
    <Link data-testid="portals-view" to="/portals">Portals View</Link>
    <Link data-testid="create-new-portal" to="/portals/new">Create New Portal</Link>
    <Link data-testid="portal-view" to="/portals/localhost-orcl-C360_ORS/2">Portal View</Link>
    <Link data-testid="portal-settings" to="/portals/localhost-orcl-C360_ORS/2/general">Portal Settings</Link>
    <Link data-testid="create-new-page" to="/portals/localhost-orcl-C360_ORS/2/page/new">Create New Page</Link>
    <Link data-testid="page-view" to="/portals/localhost-orcl-C360_ORS/2/page/1">Page View</Link>
    <Link data-testid="runtime-config" to="/portals/localhost-orcl-C360_ORS/2/runtime">Runtime Configuration</Link>
  </Router>
);

describe('workspace component', () => {
  it('should render PortalsView when route is "/portals"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('portals-view'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Portals View');
    });
  }, 30000);

  it('should render PortalSettings Component when route is "/portal/new"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('create-new-portal'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Portal View / Portal Settings');
    });
  }, 30000);

  it('should render PortalView Component when route is "/portals/:databaseId/:portalId"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('portal-view'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Portal View');
    });
  }, 30000);

  it('should render PortalSettings Component when route is "/portals/:databaseId/:portalId/general"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('portal-settings'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Portal View / Portal Settings');
    });
  }, 30000);

  it('should render PageView Component when route is "/portals/:databaseId/:portalId/page/new"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('create-new-page'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Portal Pages / Page View');
    });
  }, 30000);

  it('should render PageView Component when route is "/portals/:databaseId/:portalId/page/:pageId"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('page-view'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Portal Pages / Page View');
    });
  }, 30000);

  it('should render RuntimeConfig Component when route is "/portals/:databaseId/:portalId/runtime"', async () => {
    const { getByTestId } = renderWorkspace();
    fireEvent.click(getByTestId('runtime-config'));
    await wait(() => {
      expect(getByTestId('component-identifier').innerHTML).toBe('Runtime Configuration');
    });
  }, 30000);
});