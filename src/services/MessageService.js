import DatabaseService from './DatabaseService';

class MessageService {
    // 現在の時間帯取得
    getCurrentTimeCategory() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour <= 10) return 'morning';
        if (hour >= 11 && hour <= 16) return 'afternoon';
        if (hour >= 17 && hour <= 22) return 'evening';
        return 'late';
    }

    // 現在の曜日カテゴリ取得
    getCurrentDayCategory() {
        const day = new Date().getDay();
        
        if (day === 1) return 'monday';
        if (day === 5) return 'friday';
        if (day === 0 || day === 6) return 'weekend';
        return 'weekday';
    }

    // 現在の季節カテゴリ取得
    getCurrentSeasonCategory() {
        const month = new Date().getMonth() + 1;
        
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }

    // 【改善】知能的メッセージ選択
    async selectNotificationMessage() {
        const timeCat = this.getCurrentTimeCategory();
        const dayCat = this.getCurrentDayCategory();
        const seasonCat = this.getCurrentSeasonCategory();

        // 【改善】優先順位付きSQL検索
        const query = `
            SELECT * FROM messages
            WHERE
                (category_time = ? OR category_time = 'all') AND
                (category_day = ? OR category_day = 'all') AND
                (category_season = ? OR category_season = 'all')
            ORDER BY
                -- 完全一致を優先
                (category_time = ?) DESC,
                (category_day = ?) DESC,
                (category_season = ?) DESC,
                -- ランダム選択
                RANDOM()
            LIMIT 1;
        `;
        
        const [results] = await DatabaseService.db.executeSql(query, [
            timeCat, dayCat, seasonCat,
            timeCat, dayCat, seasonCat
        ]);

        if (results.rows.length > 0) {
            return results.rows.item(0);
        }
        
        // 【改善】フォールバック処理：カテゴリを無視してランダム選択
        const fallbackQuery = `SELECT * FROM messages ORDER BY RANDOM() LIMIT 1;`;
        const [fallbackResults] = await DatabaseService.db.executeSql(fallbackQuery);
        if (fallbackResults.rows.length > 0) {
            return fallbackResults.rows.item(0);
        }
        
        // 本当にDBが空の場合の最終手段
        return {
            id: 0,
            content: "今日もお疲れ様！私はいつでもあなたを応援してるよ〜",
            category_time: "all",
            category_day: "all", 
            category_season: "all"
        };
    }
}

export default new MessageService(); 