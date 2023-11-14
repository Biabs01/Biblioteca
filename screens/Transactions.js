import React, {Component} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default class TransactionScreen extends Component{
    render(){
        return(
            <View style={styles.container}>
                <TouchableOpacity>
                    <Text>Digitalizar QR Code</Text>
                </TouchableOpacity>
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