import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    RefreshControl 
} from 'react-native';
import DatabaseService from '../services/DatabaseService';

const MemoryScreen = ({ navigation }) => {
    const [memories, setMemories] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadMemories();
    }, []);

    const loadMemories = async () => {
        try {
            const fetchedMemories = await DatabaseService.getMemories(100);
            setMemories(fetchedMemories);
        } catch (error) {
            console.error('Failed to load memories:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMemories();
        setRefreshing(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '今日';
        } else if (diffDays === 1) {
            return '昨日';
        } else if (diffDays <= 7) {
            return `${diffDays}日前`;
        } else {
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const renderMemoryItem = ({ item }) => (
        <View style={styles.memoryItem}>
            <Text style={styles.memoryContent}>
                「{item.content}」
            </Text>
            <View style={styles.memoryFooter}>
                <Text style={styles.memoryDate}>
                    {formatDate(item.sent_at)}
                </Text>
                <Text style={styles.memoryTime}>
                    {new Date(item.sent_at).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>友人Aとの思い出</Text>
            
            {memories.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        まだメッセージがありません。{'\n'}
                        通知をONにして友人Aからの{'\n'}
                        メッセージを受け取りましょう♪
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={memories}
                    renderItem={renderMemoryItem}
                    keyExtractor={(item) => `${item.message_id}-${item.sent_at}`}
                    style={styles.memoryList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#4a9eff"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9ff',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    memoryList: {
        flex: 1,
    },
    memoryItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    memoryContent: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 12,
    },
    memoryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    memoryDate: {
        fontSize: 14,
        color: '#4a9eff',
        fontWeight: '600',
    },
    memoryTime: {
        fontSize: 12,
        color: '#999',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default MemoryScreen; 