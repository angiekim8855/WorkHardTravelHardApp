import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { theme } from "./colors";
import { useState } from "react";

export default function App() {
    const [working, setWorking] = useState(true);
    const work = () => setWorking(true);
    const travel = () => setWorking(false);
    const [text, setText] = useState("");
    const [todos, setTodos] = useState({});

    const onChangeText = (payload: any) => setText(payload);
    const addTodo = () => {
        if (text === "") return;
        // 입력한 텍스트를 투두에 추가
        const newTodos = { ...todos, [Date.now()]: { text, work: working } };
        setTodos(newTodos);
        setText("");
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <StatusBar style="light" />
                <TouchableOpacity onPress={work}>
                    <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={travel}>
                    <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                value={text}
                returnKeyType="done"
                onChangeText={onChangeText}
                onSubmitEditing={addTodo}
                placeholder={working ? "Add things to do" : "Where do you want to go?"}
                style={styles.input}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.bg,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 100,
    },
    btnText: {
        fontSize: 30,
        fontWeight: 600,
    },
    input: {
        backgroundColor: "white",
        marginTop: 20,
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 30,
        fontSize: 15,
    },
});
