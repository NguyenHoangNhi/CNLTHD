import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import style from './style';


const Approval = () => {
    const [loading, setLoading] = useState(true);
    const [pendingApprove, setPendingApprove] = useState([]);

    const getToken = async () => {
        try {
            const response = await axios.post(
                'http://192.168.1.112:8000/o/token/',
                {
                client_id: '5P70cOTiJC9VlDrrGTvpYBhetjqfJAVNZhfYkxFk',
                client_secret: 'beqXFTXg4DSwYsdgKwiRZ3uawAj4IMYpbS7pjY63B9KwjSHJQaPSQSEBN5jzGPsc6WIP2i6upMutOSz0f1IPu0d0rKHQRmjp8VVcrDnl6YCu5dGRyY0c0aUMq14ItI5K',
                grant_type: 'password',
                username: 'admin',
                password: 'admin'  
                }
            );
            console.log("API RESPONSE:", response.data)
            const accessToken = response.data.access_token;
            await AsyncStorage.setItem('access_token', accessToken);
        } catch (error) {
            console.error('Error getting access token:', error);
            Alert.alert('Error', 'Failed to authenticate admin');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingApprove = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('access_token');
            console.log("Stored Token:", storedToken);
            const response = await axios.get(
                'http://192.168.1.112:8000/approve/pending/',
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                }
            );
            console.log("Pending Approvals:", response.data);
            setPendingApprove(response.data);
        } catch (error) {
            console.error('Error getting pending approve:', error);
            Alert.alert('Error', 'Failed to fetch pending approve');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const storedToken = await AsyncStorage.getItem('access_token');
            await axios.post(
                `http://192.168.1.112:8000/approve/${id}/confirm`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                }
            );
            Alert.alert('Success', 'Yêu cầu đã được duyệt');
            fetchPendingApprove();
        } catch (error) {
            console.error('Error approving request:', error);
            Alert.alert('Error', 'Failed to approve request');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getToken();
            fetchPendingApprove();
        };
        fetchData();
    }, []);

    const renderRequestItem = ({ item }) => {
        console.log('Item:', item);  // Thêm dòng này để kiểm tra dữ liệu item
        return (
            <View style={style.itemContainer}>
                <Text style={style.name}>{`${item.student.last_name} ${item.student.first_name}`}</Text>
                <Text style={style.code}>{`MSSV: ${item.student.code}`}</Text>
                <TouchableOpacity onPress={() => handleApprove(item.id)} style={style.button}>
                    <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={style.headerContainer}>
                <Text style={style.header}>Danh sách phiếu yêu cầu</Text>
            </View> 
            <FlatList
                data={pendingApprove}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
   
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default Approval;
