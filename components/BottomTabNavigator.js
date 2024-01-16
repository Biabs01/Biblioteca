import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';;
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TransactionScreen from '../screens/Transactions';
import SearchScreen from '../screens/Search';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default class BottomTabNavigator extends Component{
    render(){
        return(
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({route}) => ({
                        tabBarIcon: ({focused, color, size}) => {
                            let iconName;

                            if(route.name === 'Transação'){
                                iconName = 'book';
                            } else if(route.name === 'Pesquisa'){
                                iconName = 'search';
                            }

                            return(
                                <Ionicons
                                    name={iconName}
                                    size={size}
                                    color={color}
                                />
                            )
                        }
                    })}>
                    <Tab.Screen name='Transação' component={TransactionScreen}/>
                    <Tab.Screen name='Pesquisa' component={SearchScreen}/>
                </Tab.Navigator>
            </NavigationContainer>
        )
    }  
}
