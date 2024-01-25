import React, {Component} from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from "react-native";
import db from './config';

export default class SearchScreen extends Component{
    constructor(props) {
        super(props);
        this.state = {
            allTransactions: []
        }
    }

    getTransactions = () => {
        db.collection('transactions')
            .get()
            .then(snapshot => {
                snapshot.docs.map(doc => {
                    this.setState({
                        allTransactions: [...this.state.allTransactions, doc.data()]
                    });
                });
            });
    }

    componentDidMount = async() => {
        this.getTransactions();
    }

    renderItem = ({item, i}) => {
        var date = item.date
            .toDate()
            .toString()
            .split(" ")
            .splice(0, 4)
            .join(" ");
        
    }

    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.text}>Tela de Pesquisa</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5653D4'
    },
    text:{
        color: "#ffffff",
        fontSize: 30
    }
})