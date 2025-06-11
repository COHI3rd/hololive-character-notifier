import SQLite from 'react-native-sqlite-storage';

class DatabaseService {
    constructor() {
        this.db = null;
    }

    async initialize() {
        try {
            this.db = await SQLite.openDatabase({
                name: 'HololiveFanApp.db',
                location: 'default',
            });
            
            await this.createTables();
            await this.loadInitialMessages();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    async createTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                category_time TEXT NOT NULL,
                category_day TEXT NOT NULL,
                category_season TEXT NOT NULL,
                category_special TEXT,
                tags TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS sent_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
            )`
        ];

        for (const query of queries) {
            await this.db.executeSql(query);
        }
    }

    // 【改善】初期メッセージデータ読み込み（高速化）
    async loadInitialMessages() {
        // 既にデータが存在するかチェック
        const [countResult] = await this.db.executeSql('SELECT count(*) as c FROM messages');
        if (countResult.rows.item(0).c > 0) {
            console.log('Messages already loaded.');
            return;
        }

        const messages = require('../data/messages.json');
        const query = `
            INSERT INTO messages (id, content, category_time, category_day, category_season, category_special, tags) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        // 【改善】トランザクションで一括挿入（高速化）
        await this.db.transaction(async tx => {
            for (const msg of messages) {
                const tagsJson = JSON.stringify(msg.tags || []);
                tx.executeSql(query, [
                    msg.id,
                    msg.content,
                    msg.category_time,
                    msg.category_day,
                    msg.category_season,
                    msg.category_special,
                    tagsJson
                ]);
            }
        });
        console.log(`${messages.length} messages loaded successfully`);
    }

    // 配送履歴保存
    async saveSentHistory(messageId) {
        const query = 'INSERT INTO sent_history (message_id) VALUES (?)';
        return this.db.executeSql(query, [messageId]);
    }

    // 思い出取得（メッセージ内容も含む）
    async getMemories(limit = 50) {
        const query = `
            SELECT 
                h.sent_at,
                m.content,
                m.id as message_id
            FROM sent_history h
            JOIN messages m ON h.message_id = m.id
            ORDER BY h.sent_at DESC 
            LIMIT ?
        `;
        const [results] = await this.db.executeSql(query, [limit]);
        
        const memories = [];
        for (let i = 0; i < results.rows.length; i++) {
            memories.push(results.rows.item(i));
        }
        return memories;
    }
}

export default new DatabaseService(); 