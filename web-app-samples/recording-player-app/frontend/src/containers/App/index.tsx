import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import IframePage from '../IframePage';
import Player from '../Player';

const App: React.FC<Record<string, never>> = () => {
  return (
    <div className="mdc-theme--background">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Player} />
          <Route path="/player" exact component={Player} />
          <Route path="/player/iframe" exact component={IframePage} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
