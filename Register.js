import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import MyStyle from "../../styles/MyStyle";
import { Button, TextInput, TouchableRipple } from "react-native-paper";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";

const Register = () => {
    const fields = [{
        label: "Tên người dùng",
        icon: "text",
        field: "username"
    },{
        label: "Tên",
        icon: "text",
        field: "first_name"
    },{
        label: "Họ và tên lót",
        icon: "text",
        field: "last_name"
    },{
        label: "Email",
        icon: "email",
        field: "email"
    },{
        label: "Mã Giảng Viên",
        icon: "account",
        field: "code"
    },{
        label: "Mật khẩu",
        icon: "eye",
        field: "password",
        secureTextEntry: true
    },{
        label: "Xác nhận mật khẩu",
        icon: "eye",
        field: "confirm",
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const change = (value, field) => {
        setUser(current => {
            return {...current, [field]: value}
        })
    }

    const picker = async () =>{
        let {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted')
            Alert.alert("ĐĂNG KÝ", "Không tải được ảnh!");
        else {
            let res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
            });
            if (!res.canceled)
                change(res.assets[0], 'avatar');
        }
    };

    const register = async () => {
        if (!user.avatar) {
            Alert.alert("ĐĂNG KÝ", "Vui lòng chọn ảnh đại diện");
            return;
        }

        if(user.password !== user.confirm){
            Alert.alert("ĐĂNG KÝ", "Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);

        try{       
            const fromData = new FormData();
            fromData.append('username', user.username);
            fromData.append('first_name', user.first_name);
            fromData.append('last_name', user.last_name);
            fromData.append('email', user.email);
            fromData.append('code', user.code);
            fromData.append('password', user.password);
            fromData.append('avatar', {
                uri: user.avatar.uri,
                type: 'image/jpeg',  // or appropriate type
                name: 'avatar.jpg'
            });
            const response = await axios.post('http://192.168.1.112:8000/accounts/lecturer/', fromData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            Alert.alert("ĐĂNG KÝ", "Đăng ký thành công, chờ xét duyệt");
        } catch (error) {
            if (error.response){
                console.error("Error response:", error.response);
                Alert.alert("ĐĂNG KÝ","Mã code hoặc Email không chính xác!");
            }else {
                console.error("Network error", error);
                Alert.alert("ĐĂNG KÝ", "Có lỗi xảy ra, vui lòng thử lại sau")
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[MyStyle.container, MyStyle.margin]}>
            <ScrollView>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <Text style={MyStyle.subject}>GIẢNG VIÊN ĐĂNG KÝ</Text>
                    {fields.map(f => <TextInput value={user[f.field]} onChangeText={t => change(t, f.field)} key={f.field} style={MyStyle.margin} label={f.label} secureTextEntry={f.secureTextEntry} right={<TextInput.Icon icon={f.icon}/>}/>)}

                    <TouchableRipple onPress={picker}>
                        <Text style={MyStyle.margin}>Chọn ảnh đại diện</Text>
                    </TouchableRipple>

                    {user.avatar && <Image source={{uri:user.avatar.uri}} style={MyStyle.avatar} />}

                    <Button icon="account" mode="contained" onPress={register} loading={loading} disabled={loading} style={MyStyle.margin}>ĐĂNG KÝ</Button>
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    )
}

export default Register;