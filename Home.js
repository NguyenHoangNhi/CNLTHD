import { View, Text } from "react-native"
import Styles from "./Styles"
import MyStyle from "../../styles/MyStyle";

const Home = ({navigation}) => {
    return(
        <View style={MyStyle.container}>
            <Text onPress={() => {navigation.navigate('Login')}}
            style={Styles.subject}>Home</Text>
        </View>
    )
}

export default Home;