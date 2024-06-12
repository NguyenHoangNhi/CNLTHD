import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import MyStyle from '../../styles/MyStyle';
import { TextInput } from 'react-native-paper';
import style from './style';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');

    const login = async () => {
        try {
            const response = await axios.post('http://192.168.1.112:8000/accounts/', {
                username: username,
                password: password,
                code: code,
            });
            const token = response.data.token;
            // Lưu token và xử lý tiếp theo
        } catch (error) {
            Alert.alert('Error', 'Invalid credentials or account not approved');
        }
    };

    return (
        <View style={[MyStyle.container, MyStyle.margin]}>
            <Text style={style.header}>ĐĂNG NHẬP</Text>
            <TextInput value={code} onChangeText={(text) => setCode(text)} placeholder="code" />
            <TextInput value={username} onChangeText={(text) => setUsername(text)} placeholder="username" />
            <TextInput value={password} onChangeText={(text) => setPassword(text)} secureTextEntry={true} placeholder="password" />
            <TouchableOpacity onPress={login}>
                <Text>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Login;
