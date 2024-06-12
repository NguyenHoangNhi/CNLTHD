import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import style from './style';
import MyStyle from '../../styles/MyStyle';

const Approve = () => {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const submitRequest = async () => {
        if (!first_name || !last_name ||!code) {
            Alert.alert('Lỗi', 'Vui lòng cung cấp đủ thông tin');
            return;
        }

        try {
            const response = await axios.post('http://192.168.1.112:8000/approve/student/', {
                first_name: first_name,
                last_name: last_name,
                code: code
            });

            Alert.alert('Thành Công', 'Gửi yêu cầu thành công');
            setFirstName('');
            setLastName('');
            setCode('');
        } catch (error) {
            console.error('Error sending request:', error);
            if (error.response && error.response.status === 400) {
                Alert.alert('Yêu cầu đang được xử lý, vui lòng chờ!');
            } else {
                Alert.alert('Lỗi', 'Mã sinh viên không tồn tại');
            }
        }finally {
            setLoading(false); }
    
    };

    return (
        <View style={[MyStyle.container, style.headerContainer, MyStyle.margin]}>
            <Text style={style.header}>YÊU CẦU XÉT DUYỆT</Text>
            <TextInput
                style={style.input}
                value={last_name}
                onChangeText={setLastName}
                placeholder="Họ sinh viên"
                placeholderTextColor="#666"
            />
            <TextInput
                style={style.input}
                value={first_name}
                onChangeText={setFirstName}
                placeholder="Tên sinh viên"
                placeholderTextColor="#666"
            />
            <TextInput
                style={style.input}
                value={code}
                onChangeText={setCode}
                placeholder="Mã số sinh viên"
                placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={submitRequest} style={style.button}>
                <Text style={style.buttonText}>Gửi yêu cầu</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Approve;
