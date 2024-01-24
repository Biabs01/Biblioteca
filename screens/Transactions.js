import React, {Component} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView } from "react-native";
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

    getBookDetails = async bookId => {
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

    getStudentDetails = async studentId => {
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

    initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
        db.collection("transactions").add({
            student_id: studentId,
            student_name: studentName,
            book_id: bookId,
            book_name: bookName,
            date: firebase.firestore.Timestamp.now().toDate(),
            transaction_type: 'issue'
        });

        db.collection("books")
            .doc(bookId)
            .update({
                is_book_available: false
            });
        
        db.collection("students")
            .doc(studentId)
            .update({
                number_of_books_issued: firebase.firestore.FieldValue.increment(1)
            });
        
        this.setState({
            bookId: '',
            studentId: ''
        });
    }

    initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
        db.collection("transactions").add({
            student_id: studentId,
            student_name: studentName,
            book_id: bookId,
            book_name: bookName,
            date: firebase.firestore.Timestamp.now().toDate(),
            transaction_type: 'return'
        });

        db.collection("books")
            .doc(bookId)
            .update({
                is_book_available: true
            });
        
        db.collection("students")
            .doc(studentId)
            .update({
                number_of_books_issued: firebase.firestore.FieldValue.increment(-1)
            });
        
        this.setState({
            bookId: '',
            studentId: ''
        });
    }

    checkBookAvailability = async bookId => {
        var bookRef = await db
            .collection('books')
            .where('book_id', '==', bookId)
            .get()

        var transactionType = '';
        if(bookRef.docs.length == 0){
            transactionType = false;
        } else {
            bookRef.docs.map(doc => {
                transactionType = doc.data().is_book_available ? 'issue' : 'return';
            });
        }

        return transactionType;
    }

    checkStudentEligibilityforBookIssue = async studentId => {
        const studentRef = await db
            .collection("students")
            .where("student_id", "==", studentId)
            .get()

        var isStudentElegible = '';
        if(studentRef.docs.length == 0){
            isStudentElegible = false;
            this.setState({
                bookId: '',
                studentId: ''
            });
            Alert.alert("O id do aluno não existe na base de dados da biblioteca");
        } else {
            studentRef.docs.map(doc => {
                if(doc.data().number_of_books_issued < 2){
                    isStudentElegible = true;
                } else {
                    isStudentElegible = false;
                    this.setState({
                        bookId: '',
                        studentId: ''
                    });
                    Alert.alert("O aluno já retirou 2 livros!");
                }
            });
        }
        return isStudentElegible;
    }

    checkStudentEligibilityforBookReturn = async (bookId, studentId) => {
        const studentRef = await db
            .collection("transactions")
            .where("book_id", "==", bookId)
            .limit(1)
            .get();

        var isStudentElegible = '';
            studentRef.docs.map(doc => {
                var lastBookTransaction = doc.data();
                if(lastBookTransaction.student_id === studentId){
                    isStudentElegible = true;
                } else {
                    isStudentElegible = false;
                    this.setState({
                        bookId: '',
                        studentId: ''
                    });
                    Alert.alert("O livro não foi retirado por este aluno!");
                }
            });
        return isStudentElegible;
    }

    handleTransaction = async () => {
        var { bookId, studentId } = this.state;
        await this.getBookDetails(bookId);
        await this.getStudentDetails(studentId);

        var transactionType = await this.checkBookAvailability(bookId);

        if(!transactionType){
            this.setState({
                bookId: '',
                studentId: ''
            });
            Alert.alert("O livro não existe na base de dados da biblioteca");
            
        } else if(transactionType === 'issue'){
            var isElegible = await this.checkStudentEligibilityforBookIssue(studentId)
                            
            if(isElegible){
                var {bookName, studentName} = this.state;
                this.initiateBookIssue(bookId, studentId, bookName, studentName);
                Alert.alert("O livro foi entregue ao aluno!");
            }

        } else {
            var isElegible = await this.checkStudentEligibilityforBookReturn(bookId, studentId);

            if(isElegible){
                var {bookName, studentName} = this.state;
                this.initiateBookReturn(bookId, studentId, bookName, studentName);
                Alert.alert("O livro foi devolvido à biblioteca!"); 
            } 
        }
    }

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
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={styles.lowerContainer}>
                    <View style={styles.textinputContainer}>
                        <TextInput
                            style={styles.textinput}
                            placeholder={"id do Livro"}
                            placeholderTextColor={"#FFFFFF"}
                            value={bookId}
                            onChangeText={text => this.setState({
                                bookId: text
                            })}
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
                            onChangeText={text => this.setState({
                                studentId: text
                            })}
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
            </KeyboardAvoidingView>
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