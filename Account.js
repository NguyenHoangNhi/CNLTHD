import axios from "axios";
import React, { useEffect, useState } from "react"
import { View, Text, FlatList, Alert, Button } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import style from "./style";

const Account = () => {
    const [loading, setLoading] = useState(true);
    const [pendingAccounts, setPendingAccounts] = useState([]);

//Lấy mã thông báo từ API
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

    const fetchPendingAccounts = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('access_token');
            const response = await axios.get(
                'http://192.168.1.112:8000/accounts/pending/',
                {
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                }
            );

            setPendingAccounts(response.data);
        } catch (error) {
            console.error('Error getting pending accounts:', error);
            Alert.alert('Error', 'Failed to fetch pending accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
       try {
        const storedToken = await AsyncStorage.getItem('access_token');
        await axios.post(`http://192.168.1.112:8000/accounts/${id}/confirm/`,{},{
            headers:{
                Authorization: `Bearer ${storedToken}`
            }
        });
        Alert.alert("Success", "Account approved successfully");
        fetchPendingAccounts();
       } catch (error){
            console.error("Error approving account:", error);
            Alert.alert("Error", "Unable to approve account");
       }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getToken();
            fetchPendingAccounts();
        };
        fetchData();
    }, []);
    
    if (loading) {
        return (
            <View style={style.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={style.container}>
            <View style={style.headerContainer}>
                <Text style={style.header}>Danh sách chờ xét duyệt</Text>
            </View>            
            <FlatList
                contentContainerStyle={style.listContent}
                data={pendingAccounts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={style.itemContainer}>
                        <View style={style.accountInfo}>
                            <Text style={style.username}>Username: {item.username}</Text>
                            <Text>Email: {item.email}</Text>
                        </View>
                        <Button title="Approve" onPress={() => handleApprove(item.id)} />
                    </View>
                )}
                ListEmptyComponent={<Text>No pending accounts</Text>}
            />
        </View>
    );
};

export default Account;