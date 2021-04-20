import React, { Component } from 'react';
import { Pressable } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';

import Stopwatch from '../components/Stopwatch';

import Dashboard from '../screens/Dashboard';
import Login from '../screens/Login';

const Stack = createStackNavigator();

export default class DashboardStackNavigator extends Component {
    constructor(props) {
        super(props);
        console.log('dashboard: ' + this.props.darkmode)
    }

    render() {
        return(
            <Stack.Navigator>
                <Stack.Screen 
                    name='Dashboard'
                    options={{
                        headerStyle: { backgroundColor: '#7641BD' },
                        headerTitleStyle: { color: '#FFFFFF' },
                        headerLeft: () => 
                        <Pressable style={{marginLeft: 17}} onPress={() => this.props.navigation.openDrawer()}>
                            <FontAwesome name="home" size={24} color='#FFFFFF'/>
                        </Pressable>
                    }}
                >
                    {props => <Dashboard {...props} logout={this.props.logout} username={this.props.username} darkmode={this.props.darkmode}/>}
                </Stack.Screen>
                <Stack.Screen 
                    name='Login'
                >
                    {props => <Login {...props} login={this.props.login} persist={this.props.persist}/>}
                </Stack.Screen>
            </Stack.Navigator>
        );
    }
}