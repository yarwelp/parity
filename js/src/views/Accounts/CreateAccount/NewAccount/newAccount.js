// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { observer } from 'mobx-react';
import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Form, Input, IdentityIcon, Loading, RadioButtons } from '@parity/ui';
import PasswordStrength from '@parity/ui/Form/PasswordStrength';
import { RefreshIcon } from '@parity/ui/Icons';

import ChangeVault from '../ChangeVault';
import styles from '../createAccount.css';

@observer
export default class CreateAccount extends Component {
  static propTypes = {
    newError: PropTypes.func.isRequired,
    createStore: PropTypes.object.isRequired,
    vaultStore: PropTypes.object
  }

  state = {
    accounts: null,
    selectedAddress: ''
  }

  componentWillMount () {
    return this.createIdentities();
  }

  render () {
    const { name, nameError, password, passwordRepeat, passwordRepeatError, passwordHint } = this.props.createStore;

    return (
      <Form>
        <Input
          autoFocus
          error={ nameError }
          hint={
            <FormattedMessage
              id='createAccount.newAccount.name.hint'
              defaultMessage='a descriptive name for the account'
            />
          }
          label={
            <FormattedMessage
              id='createAccount.newAccount.name.label'
              defaultMessage='account name'
            />
          }
          onChange={ this.onEditAccountName }
          value={ name }
        />
        <Input
          hint={
            <FormattedMessage
              id='createAccount.newAccount.hint.hint'
              defaultMessage='(optional) a hint to help with remembering the password'
            />
          }
          label={
            <FormattedMessage
              id='createAccount.newAccount.hint.label'
              defaultMessage='password hint'
            />
          }
          onChange={ this.onEditPasswordHint }
          value={ passwordHint }
        />
        <div className={ styles.passwords }>
          <div className={ styles.password }>
            <Input
              hint={
                <FormattedMessage
                  id='createAccount.newAccount.password.hint'
                  defaultMessage='a strong, unique password'
                />
              }
              label={
                <FormattedMessage
                  id='createAccount.newAccount.password.label'
                  defaultMessage='password'
                />
              }
              onChange={ this.onEditPassword }
              type='password'
              value={ password }
            />
          </div>
          <div className={ styles.password }>
            <Input
              error={ passwordRepeatError }
              hint={
                <FormattedMessage
                  id='createAccount.newAccount.password2.hint'
                  defaultMessage='verify your password'
                />
              }
              label={
                <FormattedMessage
                  id='createAccount.newAccount.password2.label'
                  defaultMessage='password (repeat)'
                />
              }
              onChange={ this.onEditPasswordRepeat }
              type='password'
              value={ passwordRepeat }
            />
          </div>
        </div>
        <PasswordStrength input={ password } />
        <ChangeVault
          createStore={ this.props.createStore }
          vaultStore={ this.props.vaultStore }
        />
        { this.renderIdentitySelector() }
        { this.renderIdentities() }
      </Form>
    );
  }

  renderIdentitySelector () {
    const { accounts, selectedAddress } = this.state;

    if (!accounts) {
      return null;
    }

    return (
      <RadioButtons
        className={ styles.selector }
        name='identitySelector'
        onChange={ this.onChangeIdentity }
        value={ selectedAddress }
        values={
          Object.keys(accounts).map((address) => {
            return {
              key: address,
              label: address
            };
          })
        }
      />
    );
  }

  renderIdentities () {
    const { accounts } = this.state;

    if (!accounts) {
      return (
        <Loading className={ styles.selector } size={ 1 } />
      );
    }

    return (
      <div className={ styles.identities }>
        {
          Object
            .keys(accounts)
            .map((address) => {
              return (
                <div
                  className={ styles.identity }
                  key={ address }
                  onTouchTap={ this.onChangeIdentity }
                >
                  <IdentityIcon
                    address={ address }
                    center
                  />
                </div>
              );
            })
        }
        <div className={ styles.refresh }>
          <Button
            onClick={ this.createIdentities }
            icon={ <RefreshIcon /> }
            label={
              <FormattedMessage
                id='createAccount.newAccount.buttons.refresh'
                defaultMessage='refresh'
              />
            }
          />
        </div>
      </div>
    );
  }

  createIdentities = () => {
    const { createStore } = this.props;

    this.setState({
      accounts: null,
      selectedAddress: ''
    });

    createStore.setAddress('');
    createStore.setPhrase('');

    return createStore
      .createIdentities()
      .then((accounts) => {
        const selectedAddress = Object.keys(accounts)[0];
        const { phrase } = accounts[selectedAddress];

        createStore.setAddress(selectedAddress);
        createStore.setPhrase(phrase);

        this.setState({
          accounts,
          selectedAddress
        });
      })
      .catch((error) => {
        this.props.newError(error);
      });
  }

  onChangeIdentity = (event, selectedAddress) => {
    const { createStore } = this.props;

    if (!selectedAddress) {
      return;
    }

    this.setState({ selectedAddress }, () => {
      const { phrase } = this.state.accounts[selectedAddress];

      createStore.setAddress(selectedAddress);
      createStore.setPhrase(phrase);
    });
  }

  onEditPasswordHint = (event, passwordHint) => {
    const { createStore } = this.props;

    createStore.setPasswordHint(passwordHint);
  }

  onEditAccountName = (event, name) => {
    const { createStore } = this.props;

    createStore.setName(name);
  }

  onEditPassword = (event, password) => {
    const { createStore } = this.props;

    createStore.setPassword(password);
  }

  onEditPasswordRepeat = (event, password) => {
    const { createStore } = this.props;

    createStore.setPasswordRepeat(password);
  }
}