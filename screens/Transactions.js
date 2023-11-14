import React, {Component} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from "expo-barcode-scanner";

export default class TransactionScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            domState: 'normal',
            hasCameraPermissions: null,
            scanned: 'false',
            scannedData: ''
        };
    }

    getCameraPermissions = async domState => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        
        this.setState({
            hasCameraPermissions: status === 'granted',
            domState: domState,
            scanned: 'false'
        });
    }

    render(){
        return(
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => this.getCameraPermissions("scanner")}>
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