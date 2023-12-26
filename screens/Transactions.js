import React, {Component} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from "expo-barcode-scanner";
import { TextInput } from "react-native-gesture-handler";
import db from '../config.js';

export default class TransactionScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
            domState: 'normal',
            hasCameraPermissions: null,
            scanned: 'false',
            bookId: '',
            studentId: '',
            bookName: '',
            studentName: ''
        };
    }

    getCameraPermissions = async domState => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        
        this.setState({
            hasCameraPermissions: status === 'granted',
            domState: domState,
            scanned: false
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
        } else if(domState === 'studentId'){
            this.setState({
                studentId: data,
                domState: "normal",
                scanned: true
            });
        }
    };

    handleTransaction = () => {

    }

    getBookDetails = bookId => {
        bookId = bookId.trim();
        db.collection("books")
            .where("book_id", "==", bookId)
            .get()
            .then(snapshot => {
                snapshot.docs.map(doc => {
                    this.setState({
                        bookName: doc.data().book_details.book_name
                    });
                });
            });
    };

    getStudentDetails = studentId => {
        studentId = studentId.trim();
        db.collection("students")
            .where("student_id", "==", studentId)
            .get()
            .then(snapshot => {
                snapshot.docs.map(doc => {
                    this.setState({
                        studentName: doc.data().student_details.student_name
                    });
                });
            });
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
                    <View style={styles.textinputContainer}>
                        <TextInput
                            style={styles.textinput}
                            placeholder={"id do Aluno"}
                            placeholderTextColor={"#FFFFFF"}
                            value={studentId}
                        />
                        <TouchableOpacity
                            style={styles.scanbutton}
                            onPress={() => this.getCameraPermissions("studentId")}>
                                <Text style={styles.scanbuttonText}>Scan</Text>
                            </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.scanbutton, {margin: 25}]}
                    onPress={this.handleTransaction}
                >
                    <Text style={styles.buttonText}>Enviar</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF"
    },
    lowerContainer: {
      flex: 0.5,
      alignItems: "center"
    },
    textinputContainer: {
      borderWidth: 2,
      borderRadius: 10,
      flexDirection: "row",
      backgroundColor: "#9DFD24",
      borderColor: "#FFFFFF"
    },
    textinput: {
      width: "57%",
      height: 50,
      padding: 10,
      borderColor: "#FFFFFF",
      borderRadius: 10,
      borderWidth: 3,
      fontSize: 18,
      backgroundColor: "#5653D4",
      color: "#FFFFFF"
    },
    scanbutton: {
      width: 100,
      height: 50,
      backgroundColor: "#9DFD24",
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      justifyContent: "center",
      alignItems: "center"
    },
    scanbuttonText: {
      fontSize: 24,
      color: "#0A0101",
    },
    button: {
        width: "43%",
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F48D20',
        borderRadius: 15
    }
    
   });