import React, {Component} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from "expo-barcode-scanner";
import { TextInput } from "react-native-gesture-handler";

export default class TransactionScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            domState: 'normal',
            hasCameraPermissions: null,
            scanned: 'false',
            scannedData: '',
            bookId: '',
            studentId: ''
        };
    }

    getCameraPermissions = async domState => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        
        this.setState({
            hasCameraPermissions: status === 'granted',
            domState: domState,
            scanned: 'false'
        });
    };

    handleBarCodeScanned = async = ({type, data}) => {
        const {domState} = this.state;

        if(domState === 'bookId'){
            this.setState({
                bookId: data,
                domState: "normal",
                scanned: true
            });
        }
    };

    render(){
        const {bookId, studentId, domState, scanned} = this.state;

        if(domState !== "normal"){
            return(
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            );
        }
        return(
            <View style={styles.container}>
                <View style={styles.lowerContainer}>
                    <View style={styles.textinputContainer}>
                        <TextInput
                            style={styles.textinput}
                            placeholder={"id do Livro"}
                            placeholderTextColor={"#FFFFFF"}
                            value={bookId}
                        />
                        <TouchableOpacity
                            style={styles.scanbutton}
                            onPress={() => this.getCameraPermissions("bookId")}>
                                <Text style={styles.scanbuttonText}>Scan</Text>
                            </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.text}>
                    {hasCameraPermissions ? scannedData : "Solicitar permissão da Câmera"}
                </Text>
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