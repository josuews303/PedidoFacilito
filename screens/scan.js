import React, { Component, Fragment } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { CheckBox } from 'react-native-elements';
import styles from './scanStyle'
import {
    TouchableOpacity,
    Text,
    StatusBar,
    Linking,
    View
} from 'react-native';

import {
    Header,
    Colors,
} from 'react-native/Libraries/NewAppScreen';

class Scan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scan: false,
            ScanResult: false,
            result: null,
            total:0,
            checkboxes: [{
                id: 1,
                title: 'one',
                checked: false,
            }, {
                id: 2,
                title: 'two',
                checked: false,
            }]
        };
    }

    async componentDidMount() {
        await this.getMenu()
    }

    getMenu = async () => {
        fetch('https://proyectosoftware2restaurante.herokuapp.com/greetings', {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        }).then((response) => response.json())
            .then(responseJson => {
                this.setState({
                    checkboxes: responseJson
                });

                console.log('Menu', this.state.menu);
            });

    }

    onSuccess = (e) => {
        const check = e.data.substring(0, 4);
        console.log('scanned data' + check);
        this.setState({
            result: e,
            scan: false,
            ScanResult: true
        })
        if (check === 'http') {
            Linking
                .openURL(e.data)
                .catch(err => console.error('An error occured', err));


        } else {
            this.setState({
                result: e,
                scan: false,
                ScanResult: true
            })
        }

    }

    activeQR = () => {
        this.setState({
            scan: true
        })
    }
    scanAgain = () => {
        this.setState({
            scan: true,
            ScanResult: false
        })
    }
    toggleCheckbox(id) {
        console.log(id)
        let changedCheckbox = this.state.checkboxes.find((cb) =>
            cb.id === id); changedCheckbox.checked = !changedCheckbox.checked;
        let chkboxes = this.state.checkboxes;
        var sub = 0;
        for (let i = 0; i < chkboxes.length; i++) {
            if (chkboxes[i].id === id) {
                chkboxes.splice(i, 1, changedCheckbox);
            };
        };
        this.setState({ checkboxes: chkboxes, });
        console.log(this.state.checkboxes)
        
        for (let i = 0; i < this.state.checkboxes.length; i++){
            if(this.state.checkboxes[i].checked){
                sub=sub+this.state.checkboxes[i].price;
            }
            
        }
        this.setState({
            total:sub
        });
        console.log(this.state.total)
    }
    render() {
        const { scan, ScanResult, result } = this.state
        const desccription = 'Cada mesa tiene un código QR, a continuación se le pedirá escanearlo para poder ingresar al menú y realizar su pedido con mayor facilidad'
        return (
            <View style={styles.scrollViewStyle}>
                <Fragment>
                    <StatusBar barStyle="dark-content" />
                    <Text style={styles.textTitle}>Bienvenido a Pedido Facilito!</Text>
                    {!scan && !ScanResult &&
                        <View style={styles.cardView} >
                            <Text numberOfLines={8} style={styles.descText}>{desccription}</Text>

                            <TouchableOpacity onPress={this.activeQR} style={styles.buttonTouchable}>
                                <Text style={styles.buttonTextStyle}>Click to Scan !</Text>
                            </TouchableOpacity>

                        </View>
                    }

                    {ScanResult &&
                        <Fragment>
                            <Text style={styles.textTitle1}> Todo listo!</Text>
                            <View style={ScanResult ? styles.scanCardView : styles.cardView}>
                                <Text>Te encuentras en la mesa # : {result.data}</Text>
                                <Text>Este es el menú del establecimiento</Text>
                                {
                                    this.state.checkboxes.map((cb) => {
                                        return (
                                            <View>

                                                <CheckBox

                                                    key={cb.id}
                                                    title={cb.message + " $" + cb.price}
                                                    checked={cb.checked}
                                                    onPress={() => this.toggleCheckbox(cb.id)}
                                                />

                                            </View>
                                        )
                                        
                                    })
                                    
                                }
                                <Text>El costo total es: {this.state.total}</Text>
                                <TouchableOpacity onPress={this.scanAgain} style={styles.buttonTouchable}>
                                    <Text style={styles.buttonTextStyle}>Escanear nuevamente</Text>
                                </TouchableOpacity>
                            
                            </View>
                        </Fragment>
                    }


                    {scan &&
                        <QRCodeScanner
                            reactivate={true}
                            showMarker={true}
                            ref={(node) => { this.scanner = node }}
                            onRead={this.onSuccess}
                            topContent={
                                <Text style={styles.centerText}>
                                    Go to <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on your computer and scan the QR code to test.</Text>
                            }
                            bottomContent={
                                <View>
                                    <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.scanner.reactivate()}>
                                        <Text style={styles.buttonTextStyle}>OK. Got it!</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.setState({ scan: false })}>
                                        <Text style={styles.buttonTextStyle}>Stop Scan</Text>
                                    </TouchableOpacity>
                                </View>

                            }
                        />
                    }
                </Fragment>
            </View>

        );
    }
}



export default Scan;