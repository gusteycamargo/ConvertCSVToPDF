import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import * as DocumentPicker from 'expo-document-picker';
import * as Papa from 'papaparse';
import * as Print from 'expo-print';
import PDFReader from 'rn-pdf-reader-js'

function MainPage() {
    const [uriFile, setUriFile] = useState('');
    const [showPDF, setShowPDF] = useState(false);

    async function selectFile() {
        let result = await DocumentPicker.getDocumentAsync({});

        if(result.type == 'success') {
            const typeSplit = result.name.split('.');
            const type = typeSplit[typeSplit.length - 1];
            result.filetype = type;
            
            //SE PRECISAR DO ARQUIVO JSON BASTA PEGAR O RESULTS.DATA NA FUNÇÃO COMPLETE!!!!!
            if(result.filetype == 'csv') {
                Papa.parse(result.uri, {
                    download: true,
                    header: true,
                    complete: function(results) {
                        let keys = Object.keys(results.data[0]);
                        let values = [];
                        for (let i = 0; i < results.data.length; i++) {
                            let arrayValues = Object.values(results.data[i]);
                            values.push(arrayValues);
                        }           
                        createPDF(keys, values)           
                  },
                  delimiter: ","
                });
            }
            else {
                Alert.alert('Poxa :c', 'Tipo de arquivo não suportado!');
            }
        }
        else {
            Alert.alert('Poxa :c', 'Houve um erro ao abrir seu arquivo, tente novamente!');
        }

        
    }

    async function createPDF(keys, values) {
        //monta titulo da tabela
        let titles = '';
        keys.map(title => {
            titles = titles + 
                    "<th>"+
                        title+
                    "</th>"
        });

        //monta dados da tabela
        let dataTable = '';
        for (let i = 0; i < values.length; i++) {
            let data = '';
            values[i].map(a => {
                data = data + 
                        "<td>"+
                            a+
                        "</td>"
            })
            let r = 
                "<tr>"+
                    data+
                "</tr>";
            dataTable = dataTable + r;     
        }


        //monta tabela
        let html = "<table style='width: 100%'>"+
            "<tr>"+
                titles+
            "</tr>"+
            dataTable+
        "</table>";

        html = html.replace(',', ' ');
        let filePath = await Print.printToFileAsync({
          html: html,
          width : 612,
          height : 792,
          base64 : false
        });
        setUriFile(filePath.uri);
        setShowPDF(true);
        
        Alert.alert('PDF Generated', filePath.uri);
      }

    return(
        <>
            {(showPDF) ? (
                <View style={{ flex: 1 }}>
                    <PDFReader
                        source={{
                        uri: uriFile,
                        }}
                    />
                    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <RectButton onPress={() => {setShowPDF(false)}} style={{ width: 150, height: 70, backgroundColor: 'green', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>Voltar</Text>
                        </RectButton>
                    </View>
                </View>
            ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <RectButton onPress={selectFile} style={{ width: 150, height: 70, backgroundColor: 'purple', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>Importar</Text>
                    </RectButton>
                </View>
            )}
        </>
    )
}

export default MainPage;