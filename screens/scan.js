import React, { Component, Fragment } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { CheckBox, List, ListItem } from 'react-native-elements';
import styles from './scanStyle'
import {
    TouchableOpacity,
    Text,
    StatusBar,
    Linking,
    View,
    TextInput,
    Image,
    SafeAreaView
} from 'react-native';
import { Rating } from 'react-native-elements';
import {
    Header,
    Colors,
} from 'react-native/Libraries/NewAppScreen';

class Scan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pedidos: [],
            msj: 'Bienvenido a Pedido Facilito!',
            scan: false,
            ScanResult: false,
            feedback: false,
            result: null,
            temp: [],
            temp2: [],
            comentario: '',
            indicaciones: '',
            total: 0,
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
        this.getMenu();
    }

    ratingCompleted(rating) {
        console.log("Rating is: " + rating)
    }

    getMenu = async () => {
        fetch('https://proyectosoftware2restaurante.herokuapp.com/obtenerMenu', {
            method: 'GET',
            headers: {
                Accept: 'application/json'
            }
        }).then((response) => response.json())
            .then(responseJson => {
                this.setState({
                    checkboxes: responseJson
                });

                this.state.checkboxes.map((cb) => {
                    this.state.temp.push(cb.platoList)

                })
                this.state.temp.map((pt) => {
                    pt.map((w) => {
                        this.state.temp2.push(w);
                    });



                })
                console.log('Menu', this.state.checkboxes);
                console.log('Temp', this.state.temp);
                console.log('Temp2', this.state.temp2);
            });
    }

    onSuccess = async (e) => {
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
            await this.getMenu()
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
    pedir = () => {
        this.state.checkboxes.map((pt) => {
            pt.platoList.map((pp) => {
                if (pp.checked) {
                    var obj = { id: pp.id, descripcion: pp.descripcion };
                    this.state.pedidos.push(obj);
                }
            })
        })
        console.log("platos:", this.state.pedidos);
        console.log("total:", this.state.total);
        console.log("mesa:", this.state.result.data);
        console.log("comentarioPedido:", this.state.indicaciones);

        fetch('http://proyectosoftware2restaurante.herokuapp.com/ingresarPedido', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mesa: this.state.result.data,
                total: this.state.total,
                platos: this.state.pedidos,
                comentarioPedido: this.state.indicaciones
            })
        }).then((response) => response.json())
            .then(responseJson => {
                console.log('Server Response: ' + JSON.stringify(responseJson));
            });
        this.feedService()
    }
    feedService = () => {
        this.setState({
            ScanResult: false,
            feedback: true,
            msj: 'Tu pedido ha sido procesado, en un momento te atenderán!'
        })
    }
    toggleCheckbox(id) {
        console.log("touchedID", id)
        let changeCHK = this.state.checkboxes;
        changeCHK.map((pt) => {
            pt.platoList.map((cc) => {
                if (cc.id === id) {
                    cc.checked = !cc.checked;
                }
            });
        });
        console.log("chk", changeCHK);

        let chkboxes = this.state.checkboxes;
        var sub = 0;
        for (let i = 0; i < chkboxes.length; i++) {
            if (chkboxes[i].id === id) {
                chkboxes.splice(i, 1, changeCHK);
            };
        };
        this.setState({ checkboxes: chkboxes, });
        console.log("changed", this.state.checkboxes)


        this.state.checkboxes.map((tt) => {
            tt.platoList.map((st) => {
                if (st.checked) {
                    sub = sub + st.precio;
                }
            })
        })
        this.setState({
            total: sub
        });
        console.log("total", this.state.total)
    }


    renderRow({ item }) {
        return (
            <ListItem
                title={item.descripcion}
                subtitle={item.precio}
            />
        )
    }

    render() {
        const { scan, ScanResult, result, feedback } = this.state
        const desccription = 'Cada mesa tiene un código QR, a continuación se le pedirá escanearlo para poder ingresar al menú y realizar su pedido con mayor facilidad'
        return (
            <SafeAreaView style={{ backgroundColor: '#99003d',flex:1,width:'100%',height:'100%' }}>
                <View style={styles.scrollViewStyle}>
                    <Fragment>
                        <StatusBar backgroundColor="#99003d" barStyle="light-content" />
                        <Text style={styles.textTitle}>{this.state.msj}</Text>
                        {!scan && !ScanResult && !feedback &&
                            <View style={styles.cardView} >
                                <Text numberOfLines={8} style={styles.descText}>{desccription}</Text>

                                <TouchableOpacity onPress={this.activeQR} style={styles.buttonTouchable}>
                                    <Text style={styles.buttonTextStyle}>Escanear !</Text>
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
                                                <View style={{ width: '80%', marginTop: 2 }}>
                                                    <Text style={{ fontWeight: 'bold' }}>{cb.descripcionCategoria}</Text>
                                                    {
                                                        cb.platoList.map((pt, i) => {
                                                            return (
                                                                <View>
                                                                    <CheckBox
                                                                        key={pt.id}
                                                                        title={pt.descripcion + " $" + pt.precio}
                                                                        checked={pt.checked}
                                                                        onPress={() => this.toggleCheckbox(pt.id)}
                                                                    />
                                                                </View>
                                                            )
                                                        })
                                                    }
                                                </View>
                                            )

                                        })

                                    }
                                    <Text>El costo total es: {this.state.total}</Text>
                                    <Text style={{ marginVertical: 2, width: '80%' }}>Si tiene indicaciones extra, por favor descríbalas aquí:</Text>
                                    <TextInput
                                        style={{ width: '80%', height: 40, borderColor: 'gray', borderWidth: 1 }}
                                        onChangeText={text => (this.setState({
                                            indicaciones: text
                                        }))}
                                        value={this.state.indicaciones}
                                        maxLength={500}
                                    />
                                    <TouchableOpacity onPress={this.pedir} style={[styles.buttonTouchable]}>
                                        <Text style={styles.buttonTextStyle}>Pedir</Text>
                                    </TouchableOpacity>


                                </View>
                            </Fragment>
                        }


                        {feedback &&
                            <Fragment>
                                <View style={{ width: '100%', justifyContent: 'center', alignItems: "center" }}>
                                    <Image style={{ width: 180, height: 180, resizeMode: 'contain' }}
                                        source={require('../img/check_verde.png')}
                                    />
                                </View>

                                <Text style={styles.textTitle1}> Luego de ser atendido,por favor califique su experiencia. </Text>
                                <View style={ScanResult ? styles.scanCardView : styles.cardView}>
                                    <Text>Otorga una calificación del 1 al 5</Text>
                                    <Rating
                                        showRating
                                        onFinishRating={this.ratingCompleted}
                                        style={{ paddingVertical: 10 }}
                                    />
                                    <Text>Deja un comentario, Gracias</Text>
                                    <TextInput
                                        style={{ marginTop: 4, height: 60, borderColor: 'gray', borderWidth: 1, width: '70%' }}
                                        onChangeText={text => (this.setState({
                                            comentario: text
                                        }))}
                                        value={this.state.comentario}
                                        maxLength={500}
                                    />
                                    <TouchableOpacity onPress={this.scanAgain} style={styles.buttonTouchable}>
                                        <Text style={styles.buttonTextStyle}>Enviar Calificación</Text>
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
                                    <Text></Text>
                                }
                                bottomContent={
                                    <View>
                                        <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.scanner.reactivate()}>
                                            <Text style={styles.buttonTextStyle}>Escanear!</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.buttonTouchable} onPress={() => this.setState({ scan: false })}>
                                            <Text style={styles.buttonTextStyle}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>

                                }
                            />
                        }
                    </Fragment>
                </View>

            </SafeAreaView>

        );
    }
}



export default Scan;