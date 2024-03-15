import React from "react";
import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";

const Error1 = ({message}) => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FCB82F'
            }}
        >
            <Image
                source={require('../../assets/404.png')}
                style={{
                    width: Dimensions.get('screen').width - 80,
                    height: 320,
                }}
                resizeMode="contain"
            />
            <Text style={{
                color: '#000',
                fontWeight: 'bold',
                fontSize: 25,
                textAlign: 'center',
            }}>
                {message}
            </Text>
            <Text
                style={{
                    color: '#000',
                    fontWeight: '600',
                    fontSize: 12,
                    marginVertical: 10,
                }}
            >
            </Text>
            <TouchableOpacity
                onPress={() => { }}
                style={{
                    backgroundColor: '#000',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    marginTop: 10,
                    borderRadius: 5,
                }}
            >
                <Text
                    style={{
                        color: '#FFF',
                        fontWeight: '600',
                        fontSize: 14,
                    }}
                >GO BACK</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Error1;