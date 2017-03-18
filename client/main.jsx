import React from 'react';
import { Meteor } from 'meteor/meteor';
import { ApolloClient, ApolloProvider } from 'react-apollo';
import { meteorClientConfig } from 'meteor/apollo';
import { render } from 'react-dom';

import App from '../imports/ui/App';

const apolloClient = new ApolloClient(meteorClientConfig());

Meteor.startup(() => {
  render(
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>,
    document.getElementById('render-target'));
});
